from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from .models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from rest_framework.exceptions import AuthenticationFailed
import datetime

# --- SERIALIZERS DE ESTRUTURA ---

class FilialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filial
        fields = ['id', 'nome', 'cidade', 'ativo']
        read_only_fields = ['id']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # REGRA: Na criação, a filial nasce Ativa por padrão e o usuário não pode mudar isso.
        if not self.instance:
            self.fields['ativo'].read_only = True


class UsuarioSerializer(serializers.ModelSerializer):
    # Campo aninhado para exibir os dados completos das filiais na leitura
    filiais_detalhes = FilialSerializer(source='filiais', many=True, read_only=True)

    # Validação explicita para garantir mensagem em Português no UniqueValidator
    cpf = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Usuario.objects.all(),
                message='Este CPF já está em uso.'
            )
        ]
    )

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'cpf', 'tipo', 'filiais', 'filiais_detalhes', 'ativo', 'password']
        extra_kwargs = {
            'password': {'write_only': True} # Senha nunca é retornada na API, apenas enviada
        }

    def validate_cpf(self, value):
        """
        REGRA DE INTEGRIDADE CRUZADA:
        Impede que um CPF cadastrado como Usuário já exista na tabela de Funcionários.
        """
        cpf_limpo = ''.join(filter(str.isdigit, value))
        if Funcionario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso")
        return value

    def validate_filiais(self, filiais):
        """
        REGRA DE INTEGRIDADE: 
        Impede associar um usuário a uma filial inativa.
        """
        for filial in filiais:
            if not filial.ativo:
                raise serializers.ValidationError(f"A filial '{filial.nome}' está inativa e não pode ser vinculada a um usuário.")
        return filiais

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request_user = self.context['request'].user
        
        # LÓGICA DE PERMISSÕES DE EDIÇÃO
        if self.instance:
            # Senha é opcional na edição
            self.fields['password'].required = False
            
            # REGRA: Coordenador/Admin editando a si mesmo -> Só pode mudar a senha (outros campos travados)
            if request_user.tipo in ['COORDENADOR', 'ADMINISTRADOR'] and self.instance == request_user:
                for field_name in self.fields:
                    if field_name != 'password':
                        self.fields[field_name].read_only = True
            
            # REGRA: Admin editando Coordenador -> Não pode mudar o CPF nem o TIPO do coordenador
            elif request_user.tipo == 'ADMINISTRADOR' and self.instance and hasattr(self.instance, 'tipo') and self.instance.tipo == 'COORDENADOR':
                self.fields['cpf'].read_only = True
                self.fields['tipo'].read_only = True

    def validate(self, data):
        request_user = self.context['request'].user
        # REGRA: Administradores só têm permissão para criar Coordenadores.
        if not self.instance and request_user.tipo == 'ADMINISTRADOR' and data.get('tipo') != 'COORDENADOR':
            raise serializers.ValidationError({"tipo": "Administradores só podem criar usuários do tipo Coordenador."})
        return data

    def create(self, validated_data):
        # Lógica para salvar ManyToMany (filiais) e Hashing de senha corretamente
        filiais_data = validated_data.pop('filiais', [])
        user = Usuario.objects.create_user(**validated_data)
        if filiais_data:
            user.filiais.set(filiais_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        filiais_data = validated_data.pop('filiais', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password) # Garante re-hash da senha se alterada
            user.save()
        if filiais_data is not None:
            user.filiais.set(filiais_data)
        return user


class DepositoSerializer(serializers.ModelSerializer):
    filial_nome = serializers.CharField(source='filial.nome', read_only=True)
    class Meta:
        model = Deposito
        fields = ['id', 'nome', 'filial', 'filial_nome', 'ativo']
        read_only_fields = ['id']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            self.fields['ativo'].read_only = True
            
    def validate_filial(self, filial):
        """
        REGRA DE INTEGRIDADE:
        Impede criar ou mover um depósito para uma filial inativa.
        """
        if not filial.ativo:
            raise serializers.ValidationError(f"Não é possível vincular este depósito a uma filial inativa ({filial.nome}).")
        return filial


class SetorSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Setor
        fields = ['id', 'nome_setor', 'descricao_setor', 'ativo']
        read_only_fields = ['id']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # REGRA: Ativo é read-only na criação
        if not self.instance:
            self.fields['ativo'].read_only = True
            
    def validate_nome_setor(self, value):
        # REGRA: Nome único case-insensitive (Ex: 'Soldagem' é igual a 'soldagem')
        query = Setor.objects.filter(nome_setor__iexact=value)
        if self.instance: query = query.exclude(pk=self.instance.pk) # Exclui o próprio se for edição
        if query.exists(): raise serializers.ValidationError("Já existe um setor com este nome.")
        return value


class CargoSerializer(serializers.ModelSerializer):
    class Meta: model = Cargo; fields = ['id', 'nome_cargo', 'descricao_cargo', 'ativo']; read_only_fields = ['id']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            self.fields['ativo'].read_only = True
    def validate_nome_cargo(self, value):
        # REGRA: Nome único case-insensitive
        query = Cargo.objects.filter(nome_cargo__iexact=value)
        if self.instance: query = query.exclude(pk=self.instance.pk)
        if query.exists(): raise serializers.ValidationError("Já existe um cargo com este nome.")
        return value


# --- FUNCIONÁRIOS E FERRAMENTAS ---

class FuncionarioSerializer(serializers.ModelSerializer):
    # Campos de leitura (detalhes expandidos)
    filiais_detalhes = FilialSerializer(source='filiais', many=True, read_only=True)
    setor_nome = serializers.CharField(source='setor.nome_setor', read_only=True)
    cargo_nome = serializers.CharField(source='cargo.nome_cargo', read_only=True)
    
    # Campo de escrita (recebe lista de IDs)
    filiais = serializers.PrimaryKeyRelatedField(queryset=Filial.objects.all(), many=True)

    class Meta:
        model = Funcionario
        fields = ['id', 'nome', 'matricula', 'cpf', 'setor', 'setor_nome', 'cargo', 'cargo_nome', 'foto', 'ativo', 'filiais', 'filiais_detalhes']
        read_only_fields = ['id', 'setor_nome', 'cargo_nome']
    
    def validate_cpf(self, value):
        # REGRA DE INTEGRIDADE CRUZADA: CPF não pode existir na tabela de Usuários
        if Usuario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso por um usuário do sistema.")
        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = self.context['request'].user
        
        # REGRA: Ativo é read-only na criação
        if not self.instance: 
            self.fields['ativo'].read_only = True
        
        # LÓGICA DE SEGURANÇA: Se Coordenador, filtra o queryset de filiais disponíveis
        filial_queryset = self.context.get('filial_queryset')
        if filial_queryset is not None:
            self.fields['filiais'].queryset = filial_queryset

    def validate_filiais(self, filiais_selecionadas):
        # REGRA: Obrigatório ter pelo menos uma filial
        if not filiais_selecionadas:
            raise serializers.ValidationError("O funcionário deve ser associado a pelo menos uma filial.")
        
        user = self.context['request'].user
        user_filiais_ids = set(user.filiais.values_list('id', flat=True)) if user.tipo == 'COORDENADOR' else set()

        for filial in filiais_selecionadas:
            # REGRA DE INTEGRIDADE: Bloquear filial inativa
            if not filial.ativo:
                raise serializers.ValidationError(f"A filial '{filial.nome}' está inativa. Não é possível vincular funcionários a ela.")

            # REGRA: Coordenador só pode associar funcionário a filiais que ele gerencia
            if user.tipo == 'COORDENADOR' and filial.id not in user_filiais_ids:
                raise serializers.ValidationError(f"Coordenadores só podem associar funcionários às suas próprias filiais. A filial '{filial.nome}' é inválida.")
                
        return filiais_selecionadas


class FerramentaSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    deposito_nome = serializers.CharField(source='deposito.nome', read_only=True)
    filial_nome = serializers.CharField(source='deposito.filial.nome', read_only=True)
    
    class Meta:
        model = Ferramenta
        fields = ['id', 'nome', 'numero_serie', 'descricao', 'foto', 'data_aquisicao', 'estado', 'estado_display', 'deposito', 'deposito_nome', 'filial_nome']
        read_only_fields = ['id', 'estado', 'estado_display']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = self.context['request'].user
        
        # REGRA: Coordenador só vê e cadastra ferramentas em depósitos das suas filiais
        if user.tipo == 'COORDENADOR':
            self.fields['deposito'].queryset = Deposito.objects.filter(filial__in=user.filiais.all())
    
    def validate_data_aquisicao(self, value):
        # REGRA: Data não pode ser futura
        if value > datetime.date.today(): raise serializers.ValidationError("A data de aquisição não pode ser uma data futura.")
        return value

    def validate_deposito(self, deposito_selecionado):
        # REGRA DE INTEGRIDADE: Bloquear depósito ou filial inativos
        if not deposito_selecionado.ativo:
            raise serializers.ValidationError(f"O depósito '{deposito_selecionado.nome}' está inativo.")
            
        if not deposito_selecionado.filial.ativo:
            raise serializers.ValidationError(f"A filial '{deposito_selecionado.filial.nome}', à qual este depósito pertence, está inativa.")

        # REGRA: Validação extra de segurança para Coordenador
        user = self.context['request'].user
        if user.tipo == 'COORDENADOR':
            user_filiais = user.filiais.all()
            if deposito_selecionado.filial not in user_filiais:
                raise serializers.ValidationError("Coordenadores só podem cadastrar ferramentas em depósitos de suas próprias filiais.")
                
        return deposito_selecionado


# --- TRANSAÇÕES (EMPRÉSTIMOS E MANUTENÇÕES) ---

class EmprestimoSerializer(serializers.ModelSerializer):
    # MethodFields para decidir se mostra dado ativo (relacionamento) ou histórico (texto)
    ferramenta_nome = serializers.SerializerMethodField(); ferramenta_numero_serie = serializers.SerializerMethodField(); funcionario_nome = serializers.SerializerMethodField(); funcionario_matricula = serializers.SerializerMethodField()
    class Meta: 
        model = Emprestimo
        fields = ['id', 'nome', 'ferramenta', 'ferramenta_nome', 'ferramenta_numero_serie', 'funcionario', 'funcionario_nome', 'funcionario_matricula', 'data_emprestimo', 'data_devolucao', 'observacoes', 'ativo']
        read_only_fields = ['id']
    
    # LÓGICA DE SNAPSHOT: Se tem objeto (ativo), mostra ele. Se não (histórico), mostra o campo de texto salvo.
    def get_ferramenta_nome(self, obj): return obj.ferramenta.nome if obj.ferramenta else obj.nome_ferramenta_historico
    def get_ferramenta_numero_serie(self, obj): return obj.ferramenta.numero_serie if obj.ferramenta else obj.numero_serie_ferramenta_historico
    def get_funcionario_nome(self, obj): return obj.funcionario.nome if obj.funcionario else obj.nome_funcionario_historico
    def get_funcionario_matricula(self, obj): return obj.funcionario.matricula if obj.funcionario else obj.matricula_funcionario_historico
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: 
            # REGRA: Na edição, não pode trocar ferramenta, funcionário ou data de início. Apenas Nome, Obs e Data Fim.
            self.fields['ferramenta'].read_only = True
            self.fields['funcionario'].read_only = True
            self.fields['data_emprestimo'].read_only = True
        else: 
            self.fields['ativo'].read_only = True

        # Aplica filtro de ferramentas disponíveis passado pela View
        ferramenta_queryset = self.context.get('ferramenta_queryset')
        if ferramenta_queryset is not None:
            self.fields['ferramenta'].queryset = ferramenta_queryset

    def validate(self, data):
        funcionario = data.get('funcionario'); ferramenta = data.get('ferramenta')
        
        if not self.instance:
            # REGRA: Ferramenta deve estar DISPONIVEL
            if ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL: 
                raise serializers.ValidationError({"ferramenta": f"A ferramenta '{ferramenta.nome}' não está disponível. Estado atual: {ferramenta.get_estado_display()}."})
            
            # REGRA DE LOCALIZAÇÃO: Funcionário deve ser da mesma filial da ferramenta
            filial_da_ferramenta = ferramenta.deposito.filial
            filiais_do_funcionario = funcionario.filiais.all()
            if filial_da_ferramenta not in filiais_do_funcionario: 
                raise serializers.ValidationError({"funcionario": f"O funcionário {funcionario.nome} não pertence à filial '{filial_da_ferramenta.nome}'."})

        data_emprestimo = self.instance.data_emprestimo if self.instance else data.get('data_emprestimo'); data_devolucao = data.get('data_devolucao')
        # REGRA: Data de devolução >= Data empréstimo
        if data_devolucao and data_emprestimo and data_devolucao < data_emprestimo: 
            raise serializers.ValidationError({"data_devolucao": "A data de devolução não pode ser anterior à data do empréstimo."})
        # REGRA: Não pode reativar
        if self.instance and not self.instance.ativo and data.get('ativo', False): 
            raise serializers.ValidationError({"ativo": "Um empréstimo finalizado não pode ser reativado."})
        
        return data

class ManutencaoSerializer(serializers.ModelSerializer):
    ferramenta_nome = serializers.SerializerMethodField()
    ferramenta_numero_serie = serializers.SerializerMethodField()
    class Meta:
        model = Manutencao
        fields = ['id', 'nome', 'tipo', 'ferramenta', 'ferramenta_nome', 'ferramenta_numero_serie', 'observacoes', 'data_inicio', 'data_fim', 'ativo']
        read_only_fields = ['id']
    
    def get_ferramenta_nome(self, obj):
        return obj.ferramenta.nome if obj.ferramenta else obj.nome_ferramenta_historico
    def get_ferramenta_numero_serie(self, obj):
        return obj.ferramenta.numero_serie if obj.ferramenta else obj.numero_serie_ferramenta_historico
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            # REGRA: Na edição, não pode trocar a ferramenta nem o tipo (Preventiva/Corretiva)
            self.fields['ferramenta'].read_only = True
            self.fields['tipo'].read_only = True 
        else:
            self.fields['ativo'].read_only = True

        # Aplica filtro
        ferramenta_queryset = self.context.get('ferramenta_queryset')
        if ferramenta_queryset is not None:
            self.fields['ferramenta'].queryset = ferramenta_queryset

    def validate_ferramenta(self, ferramenta):
        # REGRA: Só pode mandar para manutenção se estiver DISPONIVEL
        if not self.instance and ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL:
            raise serializers.ValidationError(f"A ferramenta '{ferramenta.nome}' não está disponível para manutenção. Estado atual: {ferramenta.get_estado_display()}.")
        return ferramenta


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de Login:
    Valida se o usuário está ativo antes de permitir o login e 
    adiciona 'tipo' e 'nome' ao payload do Token JWT.
    """
    
    def validate(self, attrs):
        # 1. Deixa o SimpleJWT fazer a parte dele (checar se o CPF existe e se a senha está correta)
        data = super().validate(attrs)

        # 2. Se a senha estiver certa, ele chega aqui. Agora checamos a nossa regra de negócio:
        if not self.user.ativo:
            raise AuthenticationFailed('Conta desativada. Entre em contato com o administrador.', code='usuario_inativo')

        # 3. Se estiver tudo OK (senha certa e usuário ativo), retorna os dados (token)
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['tipo'] = user.tipo
        token['nome'] = user.nome
        return token