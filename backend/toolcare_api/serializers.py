from rest_framework import serializers
from .models import Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
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
    class Meta:
        model = Funcionario
        fields = ['id', 'nome', 'matricula', 'cpf', 'setor', 'setor_nome', 'cargo', 'cargo_nome', 'foto', 'ativo', 'filiais', 'filiais_detalhes']
        read_only_fields = ['id', 'setor_nome', 'cargo_nome']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: self.fields['nome'].read_only = True; self.fields['matricula'].read_only = True; self.fields['cpf'].read_only = True
        else: self.fields['ativo'].read_only = True
    def validate_filiais(self, value):
        if not value: raise serializers.ValidationError("O funcionário deve ser associado a pelo menos uma filial.")
        return value

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
        if self.instance: self.fields['nome'].read_only = True; self.fields['numero_serie'].read_only = True; self.fields['data_aquisicao'].read_only = True
    def validate_data_aquisicao(self, value):
        if value > datetime.date.today(): raise serializers.ValidationError("A data de aquisição não pode ser uma data futura.")
        return value

class EmprestimoSerializer(serializers.ModelSerializer):
    ferramenta_nome = serializers.SerializerMethodField(); ferramenta_numero_serie = serializers.SerializerMethodField(); funcionario_nome = serializers.SerializerMethodField(); funcionario_matricula = serializers.SerializerMethodField()
    class Meta: 
        model = Emprestimo
        fields = ['id', 'nome', 'ferramenta', 'ferramenta_nome', 'ferramenta_numero_serie', 'funcionario', 'funcionario_nome', 'funcionario_matricula', 'data_emprestimo', 'data_devolucao', 'observacoes', 'ativo']
        read_only_fields = ['id', 'nome']
    def get_ferramenta_nome(self, obj): return obj.ferramenta.nome if obj.ferramenta else obj.nome_ferramenta_historico
    def get_ferramenta_numero_serie(self, obj): return obj.ferramenta.numero_serie if obj.ferramenta else obj.numero_serie_ferramenta_historico
    def get_funcionario_nome(self, obj): return obj.funcionario.nome if obj.funcionario else obj.nome_funcionario_historico
    def get_funcionario_matricula(self, obj): return obj.funcionario.matricula if obj.funcionario else obj.matricula_funcionario_historico
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: self.fields['ferramenta'].read_only = True; self.fields['funcionario'].read_only = True; self.fields['data_emprestimo'].read_only = True
        else: self.fields['ativo'].read_only = True
    def validate(self, data):
        funcionario = data.get('funcionario'); ferramenta = data.get('ferramenta')
        if not self.instance:
            if ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL: raise serializers.ValidationError({"ferramenta": f"A ferramenta '{ferramenta.nome}' não está disponível. Estado atual: {ferramenta.get_estado_display()}."})
            filiais_do_funcionario = funcionario.filiais.all(); filial_da_ferramenta = ferramenta.deposito.filial
            if filial_da_ferramenta not in filiais_do_funcionario: raise serializers.ValidationError(f"O funcionário {funcionario.nome} não pertence à filial '{filial_da_ferramenta.nome}', onde a ferramenta está localizada.")
        data_emprestimo = self.instance.data_emprestimo if self.instance else data.get('data_emprestimo'); data_devolucao = data.get('data_devolucao')
        if data_devolucao and data_emprestimo and data_devolucao < data_emprestimo: raise serializers.ValidationError({"data_devolucao": "A data de devolução não pode ser anterior à data do empréstimo."})
        if self.instance and not self.instance.ativo and data.get('ativo', False): raise serializers.ValidationError({"ativo": "Um empréstimo finalizado não pode ser reativado."})
        return data

class ManutencaoSerializer(serializers.ModelSerializer):
    ferramenta_nome = serializers.SerializerMethodField()
    ferramenta_numero_serie = serializers.SerializerMethodField()
    class Meta:
        model = Manutencao
        fields = ['id', 'nome', 'tipo', 'ferramenta', 'ferramenta_nome', 'ferramenta_numero_serie', 'data_inicio', 'data_fim', 'ativo']
        read_only_fields = ['id', 'nome']
    def get_ferramenta_nome(self, obj):
        return obj.ferramenta.nome if obj.ferramenta else obj.nome_ferramenta_historico
    def get_ferramenta_numero_serie(self, obj):
        return obj.ferramenta.numero_serie if obj.ferramenta else obj.numero_serie_ferramenta_historico
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields['ferramenta'].read_only = True
        else:
            self.fields['ativo'].read_only = True
    def validate_ferramenta(self, ferramenta):
        if not self.instance and ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL:
            raise serializers.ValidationError(f"A ferramenta '{ferramenta.nome}' não está disponível para manutenção. Estado atual: {ferramenta.get_estado_display()}.")
        return ferramenta