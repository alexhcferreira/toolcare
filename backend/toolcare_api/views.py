from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework import filters # <--- Adicione este import no topo
from rest_framework.response import Response
from django.db import transaction
from rest_framework import status
from .serializers import CustomTokenObtainPairSerializer
from .models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from .serializers import UsuarioSerializer, FilialSerializer, DepositoSerializer, SetorSerializer, CargoSerializer, FuncionarioSerializer, FerramentaSerializer, EmprestimoSerializer, ManutencaoSerializer
from .permissions import IsAdminOrMaximo, UsuarioPermissions, ReadOnly

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('nome')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, UsuarioPermissions]
    search_fields = ['nome', 'cpf', 'tipo', 'filiais__nome', 'filiais__cidade']
    

class FilialViewSet(viewsets.ModelViewSet):
    serializer_class = FilialSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    queryset = Filial.objects.all()
    search_fields = ['nome', 'cidade']

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return user.filiais.all().order_by('nome')
        return Filial.objects.all().order_by('nome')

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        filial = self.get_object()
        
        # 1. VERIFICAÇÃO DE PERMISSÃO
        if request.user.tipo != 'MAXIMO':
            return Response(
                {"error": "Apenas usuários do tipo MÁXIMO podem desativar filiais."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. VERIFICAÇÃO DE SEGURANÇA (Ferramentas em uso)
        ferramentas_em_uso = Ferramenta.objects.filter(
            deposito__filial__id=filial.id,
            estado__in=['EMPRESTADA', 'EM_MANUTENCAO']
        )

        # Se houver bloqueio, retorna 400 IMEDIATAMENTE (com a lista)
        if ferramentas_em_uso.exists():
            lista_ferramentas = [
                f"{f.nome} ({f.numero_serie}) - {f.get_estado_display()}" 
                for f in ferramentas_em_uso
            ]
            return Response(
                {
                    "error": "Bloqueio: Existem ferramentas ativas.",
                    "lista_ferramentas": lista_ferramentas
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- NOVO: MODO PREVIEW (SIMULAÇÃO) ---
        # Se o frontend mandou ?preview=true, paramos aqui.
        # Se chegou até aqui, significa que NÃO tem ferramentas bloqueando.
        if request.query_params.get('preview') == 'true':
            return Response({"status": "Liberado para desativação"}, status=status.HTTP_200_OK)

        # 3. EXECUÇÃO EM CASCATA (Só acontece se não for preview)
        with transaction.atomic():
            filial.ativo = False
            filial.save()
            filial.depositos.update(ativo=False)
            Ferramenta.objects.filter(deposito__filial=filial).update(estado='INATIVA')
            filial.funcionarios.clear() 

        return Response({"status": "Filial e itens associados desativados com sucesso."})

class DepositoViewSet(viewsets.ModelViewSet):
    serializer_class = DepositoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    queryset = Deposito.objects.all()
    search_fields = ['nome', 'filial__nome', 'filial__cidade']

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'COORDENADOR':
            return Deposito.objects.filter(filial__in=user.filiais.all()).order_by('nome')
        return Deposito.objects.all().order_by('nome')

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        deposito = self.get_object()
        
        # 1. VERIFICAÇÃO DE PERMISSÃO (Seguindo lógica de Filial: Só Máximo)
        if request.user.tipo != 'MAXIMO':
            return Response(
                {"error": "Apenas usuários do tipo MÁXIMO podem desativar depósitos."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. VERIFICAÇÃO DE SEGURANÇA (Ferramentas em uso NESTE depósito)
        ferramentas_em_uso = Ferramenta.objects.filter(
            deposito=deposito,
            estado__in=['EMPRESTADA', 'EM_MANUTENCAO']
        )

        if ferramentas_em_uso.exists():
            lista_ferramentas = [
                f"{f.nome} ({f.numero_serie}) - {f.get_estado_display()}" 
                for f in ferramentas_em_uso
            ]
            return Response(
                {
                    "error": "Bloqueio: Existem ferramentas ativas neste depósito.",
                    "lista_ferramentas": lista_ferramentas
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- MODO PREVIEW ---
        if request.query_params.get('preview') == 'true':
            return Response({"status": "Liberado para desativação"}, status=status.HTTP_200_OK)

        # 3. EXECUÇÃO EM CASCATA
        with transaction.atomic():
            # A. Desativa o Depósito
            deposito.ativo = False
            deposito.save()

            # B. Inativa Ferramentas deste depósito
            Ferramenta.objects.filter(deposito=deposito).update(estado='INATIVA')

        return Response({"status": "Depósito e ferramentas associadas desativados com sucesso."})

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all().order_by('nome_setor')
    serializer_class = SetorSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    search_fields = ['nome_setor', 'descricao_setor']

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all().order_by('nome_cargo')
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    search_fields = ['nome_cargo', 'descricao_cargo']

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