# backend/toolcare_api/models.py

from django.db import models
from django_cpf_cnpj.fields import CPFField
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import datetime


def upload_path_funcionario(instance, filename):
    """Define o caminho para upload da imagem do funcionário."""
    # funcionarios/joao_silva/foto_perfil.jpg
    return f'funcionarios/{instance.nome}/{filename}'

numeric_validator = RegexValidator(r'^\d+$', 'Somente números são permitidos.')


class Setor(models.Model):
    nome_setor = models.CharField(max_length=255)
    descricao_setor = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nome_setor

class Cargo(models.Model):
    nome_cargo = models.CharField(max_length=255)
    descricao_cargo = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nome_cargo

class Funcionario(models.Model):
    nome = models.CharField(max_length=100)
    matricula = models.CharField(
        max_length=50, 
        unique=True, 
        validators=[numeric_validator]
    )
    cpf = CPFField(masked=True, unique=True)
    setor = models.ForeignKey(Setor, on_delete=models.SET_NULL, null=True, blank=True)
    cargo = models.ForeignKey(Cargo, on_delete=models.SET_NULL, null=True, blank=True)
    foto = models.ImageField(
        upload_to=upload_path_funcionario, 
        blank=True, 
        default='defaults/default_funcionario.png' 
    )
    ativo = models.BooleanField(default=True) 

    def __str__(self):
        return self.nome
    
    def get_absolute_url(self):
        return reverse('FuncionarioView', kwargs={'matricula': self.matricula})

    def clean(self):
        """
        Impede a desativação de um funcionário com empréstimos pendentes.
        """
        # if not self.ativo:
        #     emprestimos_ativos = Emprestimo.objects.filter(
        #         funcionario=self,
        #         data_devolucao__isnull=True
        #     ).exists()
        #     if emprestimos_ativos:
        #         raise ValidationError(
        #             "Não é possível desativar o funcionário enquanto houver empréstimos ativos."
        #         )

    def save(self, *args, **kwargs):
        self.full_clean()  # Chama o método clean() antes de salvar
        super().save(*args, **kwargs)


"""
# --- Modelos para Ativação Futura ---

def upload_path_ferramenta(instance, filename):
    return f'ferramentas/{instance.nome}/{filename}'

class Ferramenta(models.Model):
    nome = models.CharField(max_length=255)
    numero_serie = models.CharField(max_length=50, unique=True)
    descricao = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to=upload_path_ferramenta, blank=True, null=True)
    data_aquisicao = models.DateField()
    
    class StatusChoices(models.TextChoices):
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        EM_USO = 'EM_USO', 'Em Uso'
        EM_MANUTENCAO = 'EM_MANUTENCAO', 'Em Manutenção'
        DESATIVADA = 'DESATIVADA', 'Desativada'

    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.DISPONIVEL)

    def __str__(self):
        return f"{self.nome} ({self.numero_serie})"

class Emprestimo(models.Model):
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.CASCADE)
    funcionario = models.ForeignKey(Funcionario, on_delete=models.CASCADE)
    data_emprestimo = models.DateField(default=datetime.date.today)
    data_devolucao = models.DateField(blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Empréstimo {self.id} - {self.ferramenta.nome}"
    
    def save(self, *args, **kwargs):
        if self.pk is None: # Se é um novo empréstimo
            self.ferramenta.status = Ferramenta.StatusChoices.EM_USO
            self.ferramenta.save()
        
        super().save(*args, **kwargs)

        if self.data_devolucao:
            self.ferramenta.status = Ferramenta.StatusChoices.DISPONIVEL
            self.ferramenta.save()

class Manutencao(models.Model):
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.CASCADE)
    
    class TipoManutencao(models.TextChoices):
        PREVENTIVA = 'PREVENTIVA', 'Preventiva'
        CORRETIVA = 'CORRETIVA', 'Corretiva'

    tipo_manutencao = models.CharField(max_length=15, choices=TipoManutencao.choices)
    data_inicio = models.DateField(default=datetime.date.today)
    data_final = models.DateField(blank=True, null=True)
    descricao_problema = models.TextField()
    solucao_aplicada = models.TextField(blank=True, null=True)


    def __str__(self):
        return f"Manutenção {self.id} - {self.ferramenta.nome}"

    def save(self, *args, **kwargs):
        if self.pk is None: # Se é uma nova manutenção
            self.ferramenta.status = Ferramenta.StatusChoices.EM_MANUTENCAO
            self.ferramenta.save()

        super().save(*args, **kwargs)

        if self.data_final:
            self.ferramenta.status = Ferramenta.StatusChoices.DISPONIVEL
            self.ferramenta.save()
"""