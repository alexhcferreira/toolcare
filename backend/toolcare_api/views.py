from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework import filters # <--- Adicione este import no topo
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomTokenObtainPairSerializer
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
    search_fields = ['nome', 'matricula', 'cpf', 'cargo__nome_cargo', 'setor__nome_setor', 'filiais__nome', 'filiais__cidade']

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Funcionario.objects.filter(filiais__in=user.filiais.all()).distinct().order_by('nome')
        return Funcionario.objects.all().order_by('nome')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated and user.tipo == 'COORDENADOR':
            context['filial_queryset'] = user.filiais.all()
        return context

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
    search_fields = [
        'nome', 
        'numero_serie', 
        'descricao', 
        'deposito__nome',           # Busca pelo nome do depósito
        'deposito__filial__nome',   # Busca pelo nome da filial
        'deposito__filial__cidade',
        'estado',  # Busca pela cidade
        'data_aquisicao'
    ]

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Ferramenta.objects.filter(deposito__filial__in=user.filiais.all()).order_by('nome')
        return Ferramenta.objects.all().order_by('nome')
    
    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        ferramenta = self.get_object()
        
        # Opcional: Impedir se estiver emprestada
        if ferramenta.estado == Ferramenta.EstadoChoices.EMPRESTADA:
             return Response({"error": "Não é possível inativar uma ferramenta emprestada."}, status=status.HTTP_400_BAD_REQUEST)
             
        ferramenta.estado = Ferramenta.EstadoChoices.INATIVA
        ferramenta.save()
        return Response({"status": "Ferramenta inativada com sucesso"})

class EmprestimoViewSet(viewsets.ModelViewSet):
    serializer_class = EmprestimoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Emprestimo.objects.all()
    # Adicione search_fields se quiser pesquisar na barra de listagem de empréstimos futuramente
    search_fields = [
        'nome', 
        'ferramenta__nome', 
        'ferramenta__numero_serie', 
        'funcionario__nome', 
        'funcionario__matricula',
        'data_emprestimo', # Permite buscar "2025-12-22"
        'data_devolucao',
        'observacoes'
    ]

    def get_queryset(self):
        user = self.request.user
        
        # Começa com todos
        queryset = Emprestimo.objects.all().order_by('-data_emprestimo')

        # 1. Regra de Segurança do Coordenador (MANTIDA)
        if user.tipo == 'COORDENADOR':
            queryset = queryset.filter(ferramenta__deposito__filial__in=user.filiais.all())

        # 2. FILTRO ESPECÍFICO DE FUNCIONÁRIO (Novo)
        # Permite: /api/emprestimos/?funcionario=5
        func_id = self.request.query_params.get('funcionario')
        if func_id:
            queryset = queryset.filter(funcionario__id=func_id)

        # 3. FILTRO DE STATUS ATIVO (Novo)
        # Permite: /api/emprestimos/?ativo=true
        ativo_param = self.request.query_params.get('ativo')
        if ativo_param is not None:
            # Converte string 'true'/'True' para booleano
            is_active = ativo_param.lower() == 'true'
            queryset = queryset.filter(ativo=is_active)
            
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        ferramenta_queryset = Ferramenta.objects.filter(estado=Ferramenta.EstadoChoices.DISPONIVEL)
        if user.is_authenticated and user.tipo == 'COORDENADOR':
            ferramenta_queryset = ferramenta_queryset.filter(deposito__filial__in=user.filiais.all())
        context['ferramenta_queryset'] = ferramenta_queryset
        return context

class ManutencaoViewSet(viewsets.ModelViewSet):
    serializer_class = ManutencaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Manutencao.objects.all()
    search_fields = [
        'nome', 
        'ferramenta__nome', 
        'ferramenta__numero_serie', 
        'tipo', 
        'data_inicio', 
        'data_fim',
        'observacoes'
    ]

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            manutencoes_ativas = Manutencao.objects.filter(ferramenta__deposito__filial__in=user.filiais.all())
            return manutencoes_ativas.order_by('-data_inicio')
        return Manutencao.objects.all().order_by('-data_inicio')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        ferramenta_queryset = Ferramenta.objects.filter(estado=Ferramenta.EstadoChoices.DISPONIVEL)
        if user.is_authenticated and user.tipo == 'COORDENADOR':
            ferramenta_queryset = ferramenta_queryset.filter(deposito__filial__in=user.filiais.all())
        context['ferramenta_queryset'] = ferramenta_queryset
        return context
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer