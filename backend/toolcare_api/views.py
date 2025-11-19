from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from .serializers import UsuarioSerializer, FilialSerializer, DepositoSerializer, SetorSerializer, CargoSerializer, FuncionarioSerializer, FerramentaSerializer, EmprestimoSerializer, ManutencaoSerializer
from .permissions import IsAdminOrMaximo, UsuarioPermissions, ReadOnly

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('nome')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, UsuarioPermissions]

class FilialViewSet(viewsets.ModelViewSet):
    serializer_class = FilialSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    queryset = Filial.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return user.filiais.all().order_by('nome')
        return Filial.objects.all().order_by('nome')

class DepositoViewSet(viewsets.ModelViewSet):
    serializer_class = DepositoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    queryset = Deposito.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Deposito.objects.filter(filial__in=user.filiais.all()).order_by('nome')
        return Deposito.objects.all().order_by('nome')

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all().order_by('nome_setor')
    serializer_class = SetorSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all().order_by('nome_cargo')
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]

class FuncionarioViewSet(viewsets.ModelViewSet):
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
    queryset = Funcionario.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Funcionario.objects.filter(filiais__in=user.filiais.all()).distinct().order_by('nome')
        return Funcionario.objects.all().order_by('nome')
    
    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdminOrMaximo()]
        return super().get_permissions()

    def get_http_method_names(self):
        methods = super().get_http_method_names()
        if self.request.user.tipo in ['ADMINISTRADOR', 'MAXIMO']:
            methods.append('delete')
        return methods

class FerramentaViewSet(viewsets.ModelViewSet):
    serializer_class = FerramentaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Ferramenta.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Ferramenta.objects.filter(deposito__filial__in=user.filiais.all()).order_by('nome')
        return Ferramenta.objects.all().order_by('nome')

class EmprestimoViewSet(viewsets.ModelViewSet):
    serializer_class = EmprestimoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Emprestimo.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            # Empréstimos podem ter sido desassociados, então filtramos pelo histórico também
            emprestimos_ativos = Emprestimo.objects.filter(ferramenta__deposito__filial__in=user.filiais.all())
            # A lógica para empréstimos inativos pode ser mais complexa se o histórico for necessário
            # Por enquanto, focamos nos ativos.
            return emprestimos_ativos.order_by('-data_emprestimo')
        return Emprestimo.objects.all().order_by('-data_emprestimo')

class ManutencaoViewSet(viewsets.ModelViewSet):
    serializer_class = ManutencaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Manutencao.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            manutencoes_ativas = Manutencao.objects.filter(ferramenta__deposito__filial__in=user.filiais.all())
            return manutencoes_ativas.order_by('-data_inicio')
        return Manutencao.objects.all().order_by('-data_inicio')