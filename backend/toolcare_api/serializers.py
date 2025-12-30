from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from .models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
import datetime

class FilialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filial
        fields = ['id', 'nome', 'cidade', 'ativo']
        read_only_fields = ['id']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            self.fields['ativo'].read_only = True

class UsuarioSerializer(serializers.ModelSerializer):

    filiais_detalhes = FilialSerializer(source='filiais', many=True, read_only=True)

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
            'password': {'write_only': True}
        }

    def validate_cpf(self, value):
        # Limpa pontuação se vier (apenas números) para garantir a busca correta
        # (O django-cpf-cnpj geralmente salva limpo no banco)
        cpf_limpo = ''.join(filter(str.isdigit, value))
        
        # Verifica na tabela OPOSTA (Funcionário)
        if Funcionario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso")
        
        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request_user = self.context['request'].user
        
        if self.instance:
            self.fields['password'].required = False
            
            if request_user.tipo in ['COORDENADOR', 'ADMINISTRADOR'] and self.instance == request_user:
                for field_name in self.fields:
                    if field_name != 'password':
                        self.fields[field_name].read_only = True
            
            elif request_user.tipo == 'ADMINISTRADOR' and self.instance.tipo == 'COORDENADOR':
                self.fields['cpf'].read_only = True
                self.fields['tipo'].read_only = True

    def validate(self, data):
        request_user = self.context['request'].user
        if not self.instance and request_user.tipo == 'ADMINISTRADOR' and data.get('tipo') != 'COORDENADOR':
            raise serializers.ValidationError({"tipo": "Administradores só podem criar usuários do tipo Coordenador."})
        return data

    def create(self, validated_data):
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
            user.set_password(password)
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

class SetorSerializer(serializers.ModelSerializer):
    class Meta: model = Setor; fields = ['id', 'nome_setor', 'descricao_setor', 'ativo']; read_only_fields = ['id']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: self.fields['nome_setor'].read_only = True
        else: self.fields['ativo'].read_only = True
    def validate_nome_setor(self, value):
        query = Setor.objects.filter(nome_setor__iexact=value)
        if self.instance: query = query.exclude(pk=self.instance.pk)
        if query.exists(): raise serializers.ValidationError("Já existe um setor com este nome.")
        return value

class CargoSerializer(serializers.ModelSerializer):
    class Meta: model = Cargo; fields = ['id', 'nome_cargo', 'descricao_cargo', 'ativo']; read_only_fields = ['id']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: self.fields['nome_cargo'].read_only = True
        else: self.fields['ativo'].read_only = True
    def validate_nome_cargo(self, value):
        query = Cargo.objects.filter(nome_cargo__iexact=value)
        if self.instance: query = query.exclude(pk=self.instance.pk)
        if query.exists(): raise serializers.ValidationError("Já existe um cargo com este nome.")
        return value

class FuncionarioSerializer(serializers.ModelSerializer):
    filiais_detalhes = FilialSerializer(source='filiais', many=True, read_only=True)
    setor_nome = serializers.CharField(source='setor.nome_setor', read_only=True)
    cargo_nome = serializers.CharField(source='cargo.nome_cargo', read_only=True)
    
    filiais = serializers.PrimaryKeyRelatedField(queryset=Filial.objects.all(), many=True)

    class Meta:
        model = Funcionario
        fields = ['id', 'nome', 'matricula', 'cpf', 'setor', 'setor_nome', 'cargo', 'cargo_nome', 'foto', 'ativo', 'filiais', 'filiais_detalhes']
        read_only_fields = ['id', 'setor_nome', 'cargo_nome']
    
    def validate_cpf(self, value):
        # Verifica na tabela OPOSTA (Usuário)
        if Usuario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso por um usuário do sistema.")
        
        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = self.context['request'].user
        
        # CORREÇÃO: Removemos o bloqueio de edição de nome, matricula e cpf.
        # Mantemos apenas o bloqueio do 'ativo' na criação.
        if not self.instance: 
            self.fields['ativo'].read_only = True
        
        filial_queryset = self.context.get('filial_queryset')
        if filial_queryset is not None:
            self.fields['filiais'].queryset = filial_queryset

    def validate_filiais(self, filiais_selecionadas):
        if not filiais_selecionadas:
            raise serializers.ValidationError("O funcionário deve ser associado a pelo menos uma filial.")
        
        user = self.context['request'].user
        if user.tipo == 'COORDENADOR':
            user_filiais_ids = set(user.filiais.values_list('id', flat=True))
            for filial in filiais_selecionadas:
                if filial.id not in user_filiais_ids:
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
        
        # REMOVIDO: O bloqueio de numero_serie e data_aquisicao foi retirado.
        
        if user.tipo == 'COORDENADOR':
            self.fields['deposito'].queryset = Deposito.objects.filter(filial__in=user.filiais.all())
    
    def validate_data_aquisicao(self, value):
        if value > datetime.date.today(): raise serializers.ValidationError("A data de aquisição não pode ser uma data futura.")
        return value

    def validate_deposito(self, deposito_selecionado):
        user = self.context['request'].user
        if user.tipo == 'COORDENADOR':
            user_filiais = user.filiais.all()
            if deposito_selecionado.filial not in user_filiais:
                raise serializers.ValidationError("Coordenadores só podem cadastrar ferramentas em depósitos de suas próprias filiais.")
        return deposito_selecionado

class EmprestimoSerializer(serializers.ModelSerializer):
    ferramenta_nome = serializers.SerializerMethodField(); ferramenta_numero_serie = serializers.SerializerMethodField(); funcionario_nome = serializers.SerializerMethodField(); funcionario_matricula = serializers.SerializerMethodField()
    class Meta: 
        model = Emprestimo
        fields = ['id', 'nome', 'ferramenta', 'ferramenta_nome', 'ferramenta_numero_serie', 'funcionario', 'funcionario_nome', 'funcionario_matricula', 'data_emprestimo', 'data_devolucao', 'observacoes', 'ativo']
        read_only_fields = ['id']
    
    def get_ferramenta_nome(self, obj): return obj.ferramenta.nome if obj.ferramenta else obj.nome_ferramenta_historico
    def get_ferramenta_numero_serie(self, obj): return obj.ferramenta.numero_serie if obj.ferramenta else obj.numero_serie_ferramenta_historico
    def get_funcionario_nome(self, obj): return obj.funcionario.nome if obj.funcionario else obj.nome_funcionario_historico
    def get_funcionario_matricula(self, obj): return obj.funcionario.matricula if obj.funcionario else obj.matricula_funcionario_historico
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: 
            self.fields['ferramenta'].read_only = True
            self.fields['funcionario'].read_only = True
            self.fields['data_emprestimo'].read_only = True
        else: 
            self.fields['ativo'].read_only = True

        ferramenta_queryset = self.context.get('ferramenta_queryset')
        if ferramenta_queryset is not None:
            self.fields['ferramenta'].queryset = ferramenta_queryset

    def validate(self, data):
        funcionario = data.get('funcionario'); ferramenta = data.get('ferramenta')
        
        if not self.instance:
            if ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL: 
                raise serializers.ValidationError({"ferramenta": f"A ferramenta '{ferramenta.nome}' não está disponível. Estado atual: {ferramenta.get_estado_display()}."})
            
            filial_da_ferramenta = ferramenta.deposito.filial
            filiais_do_funcionario = funcionario.filiais.all()
            if filial_da_ferramenta not in filiais_do_funcionario: 
                raise serializers.ValidationError({"funcionario": f"O funcionário {funcionario.nome} não pertence à filial '{filial_da_ferramenta.nome}'."})

        data_emprestimo = self.instance.data_emprestimo if self.instance else data.get('data_emprestimo'); data_devolucao = data.get('data_devolucao')
        if data_devolucao and data_emprestimo and data_devolucao < data_emprestimo: 
            raise serializers.ValidationError({"data_devolucao": "A data de devolução não pode ser anterior à data do empréstimo."})
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
            self.fields['ferramenta'].read_only = True
            self.fields['tipo'].read_only = True # <--- AGORA O TIPO É IMUTÁVEL
        else:
            self.fields['ativo'].read_only = True

        ferramenta_queryset = self.context.get('ferramenta_queryset')
        if ferramenta_queryset is not None:
            self.fields['ferramenta'].queryset = ferramenta_queryset

    def validate_ferramenta(self, ferramenta):
        if not self.instance and ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL:
            raise serializers.ValidationError(f"A ferramenta '{ferramenta.nome}' não está disponível para manutenção. Estado atual: {ferramenta.get_estado_display()}.")
        return ferramenta
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona campos personalizados ao token
        token['tipo'] = user.tipo
        token['nome'] = user.nome
        # token['filiais'] = [f.id for f in user.filiais.all()] # Opcional se precisar no futuro

        return token