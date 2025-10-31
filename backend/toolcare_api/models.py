from django.db import models
from django_cpf_cnpj.fields import CPFField
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import datetime

def upload_path_funcionario(instance, filename): return f'funcionarios/{instance.nome}/{filename}'
def upload_path_ferramenta(instance, filename): return f'ferramentas/{instance.nome}/{filename}'
numeric_validator = RegexValidator(r'^\d+$', 'Somente números são permitidos.')

class Filial(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    cidade = models.CharField(max_length=100)
    ativo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.nome} ({self.cidade})"

class Deposito(models.Model):
    nome = models.CharField(max_length=100)
    filial = models.ForeignKey(Filial, on_delete=models.CASCADE, related_name='depositos')
    ativo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.nome} - {self.filial.nome}"

class Setor(models.Model):
    nome_setor = models.CharField(max_length=255, unique=True)
    descricao_setor = models.CharField(max_length=255, null=True, blank=True)
    ativo = models.BooleanField(default=True) 
    def __str__(self): return self.nome_setor

class Cargo(models.Model):
    nome_cargo = models.CharField(max_length=255, unique=True)
    descricao_cargo = models.CharField(max_length=255, null=True, blank=True)
    ativo = models.BooleanField(default=True)
    def __str__(self): return self.nome_cargo

class Ferramenta(models.Model):
    deposito = models.ForeignKey(Deposito, on_delete=models.PROTECT)
    nome = models.CharField(max_length=255)
    numero_serie = models.CharField(max_length=50, unique=True)
    descricao = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to=upload_path_ferramenta, blank=True, default='defaults/default_ferramenta.png')
    data_aquisicao = models.DateField()
    class EstadoChoices(models.TextChoices):
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        EMPRESTADA = 'EMPRESTADA', 'Emprestada'
        EM_MANUTENCAO = 'EM_MANUTENCAO', 'Em Manutenção'
        INATIVA = 'INATIVA', 'Inativa'
    estado = models.CharField(max_length=20, choices=EstadoChoices.choices, default=EstadoChoices.DISPONIVEL)
    def __str__(self): return f"{self.nome} ({self.numero_serie})"

class Funcionario(models.Model):
    filiais = models.ManyToManyField(Filial, related_name='funcionarios')
    nome = models.CharField(max_length=100)
    matricula = models.CharField(max_length=50, unique=True, validators=[numeric_validator])
    cpf = CPFField(masked=True, unique=True)
    setor = models.ForeignKey(Setor, on_delete=models.SET_NULL, null=True, blank=True)
    cargo = models.ForeignKey(Cargo, on_delete=models.SET_NULL, null=True, blank=True)
    foto = models.ImageField(upload_to=upload_path_funcionario, blank=True, default='defaults/default_avatar.png')
    ativo = models.BooleanField(default=True)
    def __str__(self): return self.nome
    def clean(self):
        if not self.ativo:
            emprestimos_ativos = Emprestimo.objects.filter(funcionario=self, ativo=True).exists()
            if emprestimos_ativos: raise ValidationError("Não é possível inativar o funcionário enquanto houver empréstimos ativos.")
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Emprestimo(models.Model):
    nome = models.CharField(max_length=50, blank=True, null=True, unique=True)
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.SET_NULL, null=True, blank=True)
    funcionario = models.ForeignKey(Funcionario, on_delete=models.SET_NULL, null=True, blank=True)
    data_emprestimo = models.DateField(default=datetime.date.today)
    data_devolucao = models.DateField(blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    nome_ferramenta_historico = models.CharField(max_length=255, blank=True, null=True)
    numero_serie_ferramenta_historico = models.CharField(max_length=50, blank=True, null=True)
    nome_funcionario_historico = models.CharField(max_length=100, blank=True, null=True)
    matricula_funcionario_historico = models.CharField(max_length=50, blank=True, null=True)
    def __str__(self):
        return self.nome or f"Empréstimo {self.id}"
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new and self.ativo: 
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.EMPRESTADA
                self.ferramenta.save()
        if not self.ativo:
            if self.ferramenta:
                self.nome_ferramenta_historico = self.ferramenta.nome
                self.numero_serie_ferramenta_historico = self.ferramenta.numero_serie
            if self.funcionario:
                self.nome_funcionario_historico = self.funcionario.nome
                self.matricula_funcionario_historico = self.funcionario.matricula
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
                self.ferramenta.save()
            self.ferramenta = None
            self.funcionario = None
        
        super().save(*args, **kwargs)

        if is_new:
            self.nome = f"Empréstimo {self.id}"
            super().save(update_fields=['nome'])

    def delete(self, *args, **kwargs):
        if self.ferramenta and self.ferramenta.estado == Ferramenta.EstadoChoices.EMPRESTADA:
            self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
            self.ferramenta.save()
        super().delete(*args, **kwargs)

class Manutencao(models.Model):
    class TipoChoices(models.TextChoices):
        PREVENTIVA = 'PREVENTIVA', 'Preventiva'
        CORRETIVA = 'CORRETIVA', 'Corretiva'

    nome = models.CharField(max_length=50, blank=True, null=True, unique=True)
    tipo = models.CharField(max_length=15, choices=TipoChoices.choices)
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.SET_NULL, null=True, blank=True)
    data_inicio = models.DateField(default=datetime.date.today)
    data_fim = models.DateField(null=True, blank=True)
    ativo = models.BooleanField(default=True)
    nome_ferramenta_historico = models.CharField(max_length=255, blank=True, null=True)
    numero_serie_ferramenta_historico = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.nome or f"Manutenção {self.id}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new and self.ativo:
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.EM_MANUTENCAO
                self.ferramenta.save()
        if not self.ativo:
            if self.ferramenta:
                self.nome_ferramenta_historico = self.ferramenta.nome
                self.numero_serie_ferramenta_historico = self.ferramenta.numero_serie
                self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
                self.ferramenta.save()
                self.ferramenta = None
        
        super().save(*args, **kwargs)

        if is_new:
            self.nome = f"Manutenção {self.id}"
            super().save(update_fields=['nome'])

    def delete(self, *args, **kwargs):
        if self.ferramenta and self.ferramenta.estado == Ferramenta.EstadoChoices.EM_MANUTENCAO:
            self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
            self.ferramenta.save()
        super().delete(*args, **kwargs)