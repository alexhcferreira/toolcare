from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django_cpf_cnpj.fields import CPFField
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import datetime

# --- FUNÇÕES AUXILIARES ---
# Define a organização de pastas para upload de arquivos.
# As fotos serão salvas em pastas com o nome da entidade (ex: media/funcionarios/Joao/foto.jpg)
def upload_path_funcionario(instance, filename): return f'funcionarios/{instance.nome}/{filename}'
def upload_path_ferramenta(instance, filename): return f'ferramentas/{instance.nome}/{filename}'

# Validador para garantir que campos numéricos (como matrícula) não recebam letras
numeric_validator = RegexValidator(r'^\d+$', 'Somente números são permitidos.')


# --- GERENCIAMENTO DE USUÁRIOS ---

class UsuarioManager(BaseUserManager):
    """
    Gerenciador customizado para o modelo de Usuário.
    Necessário porque substituímos o 'username' padrão pelo 'cpf'.
    """
    def create_user(self, cpf, nome, password=None, **extra_fields):
        if not cpf:
            raise ValueError('O CPF é obrigatório')
        
        # Remove is_staff se vier nos argumentos, pois a property na classe Usuario já trata disso
        extra_fields.pop('is_staff', None)

        user = self.model(cpf=cpf, nome=nome, **extra_fields)
        user.set_password(password) # Garante a criptografia da senha (Hash)
        user.save(using=self._db)
        return user

    def create_superuser(self, cpf, nome, password=None, **extra_fields):
        """ Cria um usuário com permissões totais (admin do Django e do Sistema) """
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('tipo', 'MAXIMO')
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(cpf, nome, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de Usuário personalizado para autenticação no sistema.
    Substitui o User padrão do Django.
    """
    class TipoChoices(models.TextChoices):
        MAXIMO = 'MAXIMO', 'Máximo'              # Acesso total global
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador' # Acesso de gestão
        COORDENADOR = 'COORDENADOR', 'Coordenador'     # Acesso restrito às suas filiais

    # Campos de Identificação
    cpf = CPFField(unique=True) # Usado como Login
    nome = models.CharField(max_length=255)
    
    # Controle de Acesso e Permissões
    tipo = models.CharField(max_length=15, choices=TipoChoices.choices)
    
    # Relacionamento para Coordenadores saberem quais dados podem ver
    filiais = models.ManyToManyField('Filial', blank=True)
    
    # Soft Delete: Usuários não são apagados, apenas inativados
    ativo = models.BooleanField(default=True)

    objects = UsuarioManager()

    # Configurações do Django Auth
    USERNAME_FIELD = 'cpf' # Define que o login é feito via CPF
    REQUIRED_FIELDS = ['nome', 'tipo']

    @property
    def is_staff(self):
        # Permite que todos os usuários acessem o admin do Django se necessário,
        # mas as permissões reais são controladas via código (IsAdminOrMaximo)
        return True

    def __str__(self):
        return self.nome


# --- ESTRUTURA ORGANIZACIONAL ---

class Filial(models.Model):
    """ Representa uma unidade física da empresa (ex: Usina SP) """
    nome = models.CharField(max_length=100, unique=True)
    cidade = models.CharField(max_length=100)
    ativo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nome} ({self.cidade})"

class Deposito(models.Model):
    """ 
    Local físico dentro de uma filial onde as ferramentas são guardadas.
    Ex: Almoxarifado Central, Depósito de Campo.
    """
    nome = models.CharField(max_length=100)
    filial = models.ForeignKey(Filial, on_delete=models.CASCADE, related_name='depositos')
    ativo = models.BooleanField(default=True)
    
    class Meta:
        # REGRA DE NEGÓCIO: Unicidade Composta
        # Impede que existam dois depósitos com o mesmo nome NA MESMA FILIAL.
        # Mas permite nomes iguais em filiais diferentes.
        constraints = [
            models.UniqueConstraint(fields=['nome', 'filial'], name='unique_nome_por_filial')
        ]
        
    def __str__(self):
        return f"{self.nome} - {self.filial.nome}"

class Setor(models.Model):
    """ Setor de trabalho do funcionário (ex: Manutenção, Produção) """
    nome_setor = models.CharField(max_length=255, unique=True)
    descricao_setor = models.CharField(max_length=255, null=True, blank=True)
    ativo = models.BooleanField(default=True) 
    def __str__(self): return self.nome_setor

class Cargo(models.Model):
    """ Cargo do funcionário (ex: Mecânico, Eletricista) """
    nome_cargo = models.CharField(max_length=255, unique=True)
    descricao_cargo = models.CharField(max_length=255, null=True, blank=True)
    ativo = models.BooleanField(default=True)
    def __str__(self): return self.nome_cargo


# --- INVENTÁRIO E PESSOAL ---

class Ferramenta(models.Model):
    """ 
    Representa o ativo físico. 
    A ferramenta é o item central do sistema de rastreamento.
    """
    # Vínculo hierárquico: Ferramenta -> Depósito -> Filial
    deposito = models.ForeignKey(Deposito, on_delete=models.PROTECT)
    
    nome = models.CharField(max_length=255)
    numero_serie = models.CharField(max_length=50, unique=True) # Identificador único global
    descricao = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to=upload_path_ferramenta, blank=True, default='defaults/default_ferramenta.png')
    data_aquisicao = models.DateField(blank=True, null=True)
    
    class EstadoChoices(models.TextChoices):
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        EMPRESTADA = 'EMPRESTADA', 'Emprestada'
        EM_MANUTENCAO = 'EM_MANUTENCAO', 'Em Manutenção'
        INATIVA = 'INATIVA', 'Inativa' # Soft delete para ferramentas
        
    # O estado é gerenciado automaticamente pelas transações (Empréstimo/Manutenção)
    estado = models.CharField(max_length=20, choices=EstadoChoices.choices, default=EstadoChoices.DISPONIVEL)
    
    def __str__(self): return f"{self.nome} ({self.numero_serie})"

class Funcionario(models.Model):
    """ Colaborador que pode retirar ferramentas """
    # Um funcionário pode atuar em múltiplas filiais (Many-to-Many)
    filiais = models.ManyToManyField(Filial, related_name='funcionarios')
    
    nome = models.CharField(max_length=100)
    matricula = models.CharField(max_length=50, unique=True, validators=[numeric_validator])
    cpf = CPFField(masked=True, unique=True)
    
    # Setor e Cargo são opcionais (on_delete=SET_NULL preserva o histórico se o cargo for apagado)
    setor = models.ForeignKey(Setor, on_delete=models.SET_NULL, null=True, blank=True)
    cargo = models.ForeignKey(Cargo, on_delete=models.SET_NULL, null=True, blank=True)
    
    foto = models.ImageField(upload_to=upload_path_funcionario, blank=True, default='defaults/default_avatar.png')
    ativo = models.BooleanField(default=True)
    
    def __str__(self): return self.nome
    
    def clean(self):
        """ 
        REGRA DE NEGÓCIO: Integridade de Empréstimos.
        Não permite desativar (demitir) um funcionário se ele ainda tiver ferramentas em sua posse.
        """
        if not self.ativo:
            emprestimos_ativos = Emprestimo.objects.filter(funcionario=self, ativo=True).exists()
            if emprestimos_ativos: 
                raise ValidationError("Não é possível inativar o funcionário enquanto houver empréstimos ativos.")
    
    def save(self, *args, **kwargs):
        self.full_clean() # Força a execução da validação clean() antes de salvar
        super().save(*args, **kwargs)


# --- TRANSAÇÕES (O CORAÇÃO DO SISTEMA) ---

class Emprestimo(models.Model):
    """ Registra a saída de uma ferramenta para um funcionário """
    nome = models.CharField(max_length=50, blank=True, null=True, unique=True)
    
    # Relacionamentos Ativos (Foreign Keys)
    # Quando o empréstimo finaliza, estes campos viram NULL para quebrar o vínculo
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.SET_NULL, null=True, blank=True)
    funcionario = models.ForeignKey(Funcionario, on_delete=models.SET_NULL, null=True, blank=True)
    
    data_emprestimo = models.DateField(default=datetime.date.today)
    data_devolucao = models.DateField(blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    
    # Controle de Estado do Empréstimo (True = Em andamento / False = Finalizado)
    ativo = models.BooleanField(default=True)
    
    # --- SNAPSHOT DE HISTÓRICO ---
    # Estes campos guardam os dados de texto no momento da devolução.
    # Garante que o relatório histórico funcione mesmo se a ferramenta ou funcionário forem excluídos no futuro.
    nome_ferramenta_historico = models.CharField(max_length=255, blank=True, null=True)
    numero_serie_ferramenta_historico = models.CharField(max_length=50, blank=True, null=True)
    nome_funcionario_historico = models.CharField(max_length=100, blank=True, null=True)
    matricula_funcionario_historico = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.nome or f"Empréstimo {self.id}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # REGRA DE NEGÓCIO: Início de Empréstimo
        # Ao criar, muda o estado da ferramenta automaticamente.
        if is_new and self.ativo: 
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.EMPRESTADA
                self.ferramenta.save()
        
        # REGRA DE NEGÓCIO: Devolução / Finalização
        # Ao desativar o empréstimo:
        # 1. Copia dados para campos de histórico (Snapshot).
        # 2. Libera a ferramenta (Estado = Disponível).
        # 3. Quebra os vínculos de chave estrangeira.
        if not self.ativo:
            if self.ferramenta:
                self.nome_ferramenta_historico = self.ferramenta.nome
                self.numero_serie_ferramenta_historico = self.ferramenta.numero_serie
            if self.funcionario:
                self.nome_funcionario_historico = self.funcionario.nome
                self.matricula_funcionario_historico = self.funcionario.matricula
            
            # Libera a ferramenta
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
                self.ferramenta.save()
            
            # Anula relacionamentos
            self.ferramenta = None
            self.funcionario = None
        
        super().save(*args, **kwargs)

        # Gera nome automático após salvar (para ter o ID)
        if is_new:
            self.nome = f"Empréstimo {self.id}"
            super().save(update_fields=['nome'])

    def delete(self, *args, **kwargs):
        """ 
        Segurança: Se um empréstimo for deletado (hard delete) enquanto ativo,
        garante que a ferramenta volte a ficar disponível para não travar o sistema.
        """
        if self.ferramenta and self.ferramenta.estado == Ferramenta.EstadoChoices.EMPRESTADA:
            self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
            self.ferramenta.save()
        super().delete(*args, **kwargs)

class Manutencao(models.Model):
    """ Registra a saída de uma ferramenta para conserto """
    class TipoChoices(models.TextChoices):
        PREVENTIVA = 'PREVENTIVA', 'Preventiva'
        CORRETIVA = 'CORRETIVA', 'Corretiva'

    nome = models.CharField(max_length=50, blank=True, null=True, unique=True)
    tipo = models.CharField(max_length=15, choices=TipoChoices.choices)
    ferramenta = models.ForeignKey(Ferramenta, on_delete=models.SET_NULL, null=True, blank=True)
    observacoes = models.TextField(blank=True, null=True) 
    data_inicio = models.DateField(default=datetime.date.today)
    data_fim = models.DateField(null=True, blank=True)
    ativo = models.BooleanField(default=True)
    
    # Snapshot de Histórico
    nome_ferramenta_historico = models.CharField(max_length=255, blank=True, null=True)
    numero_serie_ferramenta_historico = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.nome or f"Manutenção {self.id}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # REGRA: Ao iniciar manutenção, ferramenta fica indisponível
        if is_new and self.ativo:
            if self.ferramenta:
                self.ferramenta.estado = Ferramenta.EstadoChoices.EM_MANUTENCAO
                self.ferramenta.save()

        # REGRA: Ao finalizar manutenção
        if not self.ativo:
            if self.ferramenta:
                # Salva histórico
                self.nome_ferramenta_historico = self.ferramenta.nome
                self.numero_serie_ferramenta_historico = self.ferramenta.numero_serie
                
                # Libera ferramenta
                self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
                self.ferramenta.save()
                
                # Desvincula
                self.ferramenta = None
        
        super().save(*args, **kwargs)

        if is_new:
            self.nome = f"Manutenção {self.id}"
            super().save(update_fields=['nome'])

    def delete(self, *args, **kwargs):
        # Segurança: Libera ferramenta se deletar manutenção ativa
        if self.ferramenta and self.ferramenta.estado == Ferramenta.EstadoChoices.EM_MANUTENCAO:
            self.ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
            self.ferramenta.save()
        super().delete(*args, **kwargs)