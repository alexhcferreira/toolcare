from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from rest_framework.views import APIView
import re

from .models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from .serializers import (
    CustomTokenObtainPairSerializer, UsuarioSerializer, FilialSerializer, 
    DepositoSerializer, SetorSerializer, CargoSerializer, FuncionarioSerializer, 
    FerramentaSerializer, EmprestimoSerializer, ManutencaoSerializer
)
from .permissions import IsAdminOrMaximo, UsuarioPermissions, ReadOnly

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Filtros de Coordenador (se necessário)
        if user.tipo == 'COORDENADOR':
            filiais = user.filiais.all()
            total_funcionarios = Funcionario.objects.filter(filiais__in=filiais).distinct().count()
            total_ferramentas = Ferramenta.objects.filter(deposito__filial__in=filiais).count()
            
            # Ferramentas por status
            ferramentas_disponiveis = Ferramenta.objects.filter(deposito__filial__in=filiais, estado='DISPONIVEL').count()
            ferramentas_emprestadas = Ferramenta.objects.filter(deposito__filial__in=filiais, estado='EMPRESTADA').count()
            ferramentas_manutencao = Ferramenta.objects.filter(deposito__filial__in=filiais, estado='EM_MANUTENCAO').count()
            
            # Funcionários com/sem empréstimo
            # (Lógica simplificada: se tem empréstimo ativo, conta)
            # Count distinct de funcionarios em emprestimos ativos
            funcs_com_emprestimo = Emprestimo.objects.filter(
                ferramenta__deposito__filial__in=filiais, 
                ativo=True
            ).values('funcionario').distinct().count()

        else:
            # ADMIN / MAXIMO (Vê tudo)
            total_funcionarios = Funcionario.objects.count()
            total_ferramentas = Ferramenta.objects.count()
            
            ferramentas_disponiveis = Ferramenta.objects.filter(estado='DISPONIVEL').count()
            ferramentas_emprestadas = Ferramenta.objects.filter(estado='EMPRESTADA').count()
            ferramentas_manutencao = Ferramenta.objects.filter(estado='EM_MANUTENCAO').count()
            
            funcs_com_emprestimo = Emprestimo.objects.filter(ativo=True).values('funcionario').distinct().count()

        funcs_sem_emprestimo = total_funcionarios - funcs_com_emprestimo
        if funcs_sem_emprestimo < 0: funcs_sem_emprestimo = 0 # Segurança

        data = {
            'total_funcionarios': total_funcionarios,
            'total_ferramentas': total_ferramentas,
            'funcionarios': {
                'com_emprestimo': funcs_com_emprestimo,
                'sem_emprestimo': funcs_sem_emprestimo
            },
            'ferramentas': {
                'disponiveis': ferramentas_disponiveis,
                'emprestadas': ferramentas_emprestadas,
                'manutencao': ferramentas_manutencao
            }
        }
        
        return Response(data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('nome')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, UsuarioPermissions]
    search_fields = ['nome', 'cpf', 'tipo', 'filiais__nome', 'filiais__cidade']

    def get_queryset(self):
        queryset = Usuario.objects.all().order_by('nome')

        # Filtros Específicos
        search_field = self.request.query_params.get('search_field')
        search_value = self.request.query_params.get('search_value')

        if search_field and search_value:
            if search_field == 'tipo':
                queryset = queryset.filter(tipo=search_value)
            else:
                campos_map = {
                    'nome': 'nome__icontains',
                    'cpf': 'cpf__icontains',
                    'filial': 'filiais__nome__icontains'
                }
                if search_field in campos_map:
                    queryset = queryset.filter(**{campos_map[search_field]: search_value})

        # Filtros de Status
        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)

        return queryset.distinct()
    

class FilialViewSet(viewsets.ModelViewSet):
    serializer_class = FilialSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    queryset = Filial.objects.all()
    search_fields = ['nome', 'cidade']

    def get_queryset(self):
        user = self.request.user
        
        if user.tipo == 'COORDENADOR':
            queryset = user.filiais.all().order_by('nome')
        else:
            queryset = Filial.objects.all().order_by('nome')

        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)

        return queryset

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        filial = self.get_object()
        
        if request.user.tipo != 'MAXIMO':
            return Response({"error": "Apenas usuários do tipo MÁXIMO podem desativar filiais."}, status=status.HTTP_403_FORBIDDEN)

        ferramentas_em_uso = Ferramenta.objects.filter(
            deposito__filial__id=filial.id,
            estado__in=['EMPRESTADA', 'EM_MANUTENCAO']
        )

        if ferramentas_em_uso.exists():
            lista_ferramentas = [
                f"{f.nome} ({f.numero_serie}) - {f.get_estado_display()}" 
                for f in ferramentas_em_uso
            ]
            return Response(
                {"error": "Bloqueio: Existem ferramentas ativas.", "lista_ferramentas": lista_ferramentas}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.query_params.get('preview') == 'true':
            return Response({"status": "Liberado"}, status=status.HTTP_200_OK)

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
            queryset = Deposito.objects.filter(filial__in=user.filiais.all()).order_by('nome')
        else:
            queryset = Deposito.objects.all().order_by('nome')

        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)
            
        return queryset

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        deposito = self.get_object()
        
        if request.user.tipo != 'MAXIMO':
            return Response({"error": "Apenas usuários do tipo MÁXIMO podem desativar depósitos."}, status=status.HTTP_403_FORBIDDEN)

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
                {"error": "Bloqueio: Existem ferramentas ativas neste depósito.", "lista_ferramentas": lista_ferramentas}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.query_params.get('preview') == 'true':
            return Response({"status": "Liberado"}, status=status.HTTP_200_OK)

        with transaction.atomic():
            deposito.ativo = False
            deposito.save()
            Ferramenta.objects.filter(deposito=deposito).update(estado='INATIVA')

        return Response({"status": "Depósito e ferramentas associadas desativados com sucesso."})


class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all().order_by('nome_setor')
    serializer_class = SetorSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    search_fields = ['nome_setor', 'descricao_setor']

    def get_queryset(self):
        queryset = Setor.objects.all().order_by('nome_setor')
        
        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)
            
        return queryset

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all().order_by('nome_cargo')
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMaximo|ReadOnly]
    search_fields = ['nome_cargo', 'descricao_cargo']

    def get_queryset(self):
        queryset = Cargo.objects.all().order_by('nome_cargo')
        
        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)
            
        return queryset


class FuncionarioViewSet(viewsets.ModelViewSet):
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
    queryset = Funcionario.objects.all()
    search_fields = ['nome', 'matricula', 'cpf', 'cargo__nome_cargo', 'setor__nome_setor', 'filiais__nome', 'filiais__cidade']

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        funcionario = self.get_object()
        
        if not funcionario.ativo:
             return Response({"error": "Funcionário já está inativo."}, status=status.HTTP_400_BAD_REQUEST)
             
        # Bloqueia se tiver empréstimo ativo (Segurança extra)
        tem_emprestimo = Emprestimo.objects.filter(funcionario=funcionario, ativo=True).exists()
        if tem_emprestimo:
             return Response({"error": "Não é possível desativar funcionário com empréstimos ativos."}, status=status.HTTP_400_BAD_REQUEST)

        funcionario.ativo = False
        funcionario.save()
        return Response({"status": "Funcionário desativado com sucesso"})

    @action(detail=True, methods=['patch'])
    def reativar(self, request, pk=None):
        funcionario = self.get_object()
        
        if funcionario.ativo:
             return Response({"error": "Funcionário já está ativo."}, status=status.HTTP_400_BAD_REQUEST)
             
        funcionario.ativo = True
        funcionario.save()
        return Response({"status": "Funcionário reativado com sucesso"})

    def get_queryset(self):
        user = self.request.user
        queryset = Funcionario.objects.all().order_by('nome')

        if user.tipo == 'COORDENADOR':
            queryset = queryset.filter(filiais__in=user.filiais.all()).distinct()

        filial_id = self.request.query_params.get('filial')
        if filial_id:
            queryset = queryset.filter(filiais__id=filial_id)

        search_field = self.request.query_params.get('search_field')
        search_value = self.request.query_params.get('search_value')

        if search_field and search_value:
            campos_map = {
                'nome': 'nome__icontains',
                'matricula': 'matricula__icontains',
                'cpf': 'cpf__icontains',
                'cargo': 'cargo__nome_cargo__icontains',
                'setor': 'setor__nome_setor__icontains',
                'filial_nome': 'filiais__nome__icontains'
            }

            if search_value.lower() in ['sem', 'nenhum', 'null', 'vazio']:
                if search_field == 'cargo':
                    queryset = queryset.filter(cargo__isnull=True)
                elif search_field == 'setor':
                    queryset = queryset.filter(setor__isnull=True)
                elif search_field in campos_map:
                     lookup = campos_map[search_field]
                     queryset = queryset.filter(**{lookup: search_value})

            elif search_field in campos_map:
                lookup = campos_map[search_field]
                queryset = queryset.filter(**{lookup: search_value})

        if self.request.query_params.get('somente_ativos') == 'true':
            queryset = queryset.filter(ativo=True)
        if self.request.query_params.get('somente_inativos') == 'true':
            queryset = queryset.filter(ativo=False)

        return queryset.distinct()
    
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
    queryset = Ferramenta.objects.all().order_by('nome')
    
    search_fields = [
        'nome', 'numero_serie', 'descricao', 
        'deposito__nome', 'deposito__filial__nome', 'deposito__filial__cidade',
        'estado', 'data_aquisicao'
    ]

    @action(detail=True, methods=['patch'])
    def reativar(self, request, pk=None):
        ferramenta = self.get_object()
        
        # Só reativa se estiver INATIVA
        if ferramenta.estado != Ferramenta.EstadoChoices.INATIVA:
             return Response({"error": "Apenas ferramentas inativas podem ser reativadas."}, status=status.HTTP_400_BAD_REQUEST)
             
        ferramenta.estado = Ferramenta.EstadoChoices.DISPONIVEL
        ferramenta.save()
        
        return Response({"status": "Ferramenta reativada com sucesso"})

    @action(detail=True, methods=['patch'])
    def desativar(self, request, pk=None):
        ferramenta = self.get_object()
        if ferramenta.estado != Ferramenta.EstadoChoices.DISPONIVEL:
             return Response({"error": "Apenas ferramentas disponíveis podem ser desativadas."}, status=status.HTTP_400_BAD_REQUEST)
        ferramenta.estado = Ferramenta.EstadoChoices.INATIVA
        ferramenta.save()
        return Response({"status": "Ferramenta inativada com sucesso"})

    def get_queryset(self):
        user = self.request.user
        queryset = Ferramenta.objects.all().order_by('nome')

        if user.tipo == 'COORDENADOR':
            queryset = queryset.filter(deposito__filial__in=user.filiais.all())

        filial_id = self.request.query_params.get('filial')
        if filial_id:
            queryset = queryset.filter(deposito__filial__id=filial_id)

        search_field = self.request.query_params.get('search_field')
        search_value = self.request.query_params.get('search_value')

        if search_field and search_value:
            if search_field == 'data_aquisicao' and '/' in search_value:
                try:
                    partes = search_value.split('/')
                    if len(partes) == 3:
                        dia, mes, ano = partes
                        if dia.lower() != 'xx': queryset = queryset.filter(data_aquisicao__day=int(dia))
                        if mes.lower() != 'xx': queryset = queryset.filter(data_aquisicao__month=int(mes))
                        if ano.lower() != 'xxxx': queryset = queryset.filter(data_aquisicao__year=int(ano))
                except ValueError: pass

            elif search_field == 'estado':
                estados = search_value.split(',')
                queryset = queryset.filter(estado__in=estados)

            else:
                campos_map = {
                    'nome': 'nome__icontains',
                    'numero_serie': 'numero_serie__icontains',
                    'descricao': 'descricao__icontains',
                    'deposito': 'deposito__nome__icontains',
                    'filial_nome': 'deposito__filial__nome__icontains',
                    'cidade': 'deposito__filial__cidade__icontains'
                }
                if search_field in campos_map:
                    lookup = campos_map[search_field]
                    queryset = queryset.filter(**{lookup: search_value})

        if self.request.query_params.get('somente_disponiveis_emprestadas_manutencao') == 'true':
            queryset = queryset.exclude(estado='INATIVA')

        if self.request.query_params.get('somente_inativas') == 'true':
            queryset = queryset.filter(estado='INATIVA')

        return queryset

class EmprestimoViewSet(viewsets.ModelViewSet):
    serializer_class = EmprestimoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Emprestimo.objects.all()
    search_fields = [
        'nome', 
        'ferramenta__nome', 'ferramenta__numero_serie', 
        'funcionario__nome', 'funcionario__matricula',
        'data_emprestimo', 'data_devolucao', 'observacoes'
    ]

    def get_queryset(self):
        user = self.request.user
        queryset = Emprestimo.objects.all().order_by('-data_emprestimo')

        if user.tipo == 'COORDENADOR':
            queryset = queryset.filter(ferramenta__deposito__filial__in=user.filiais.all())

        func_id = self.request.query_params.get('funcionario')
        if func_id:
            queryset = queryset.filter(funcionario__id=func_id)

        search_field = self.request.query_params.get('search_field')
        search_value = self.request.query_params.get('search_value')

        if search_field and search_value:
            if search_field in ['data_emprestimo', 'data_devolucao'] and '/' in search_value:
                try:
                    partes = search_value.split('/')
                    if len(partes) == 3:
                        dia, mes, ano = partes
                        filtro = {}
                        if dia.lower() != 'xx': filtro[f'{search_field}__day'] = int(dia)
                        if mes.lower() != 'xx': filtro[f'{search_field}__month'] = int(mes)
                        if ano.lower() != 'xxxx': filtro[f'{search_field}__year'] = int(ano)
                        queryset = queryset.filter(**filtro)
                except ValueError: pass

            elif search_value.lower() in ['sem', 'nenhum', 'null', 'vazio', 'em aberto', 'aberto']:
                if search_field == 'data_devolucao':
                    queryset = queryset.filter(data_devolucao__isnull=True)
            
            else:
                campos_map = {
                    'nome': 'nome__icontains',
                    'ferramenta': 'ferramenta__nome__icontains',
                    'serial': 'ferramenta__numero_serie__icontains',
                    'funcionario': 'funcionario__nome__icontains',
                    'matricula': 'funcionario__matricula__icontains',
                    'observacoes': 'observacoes__icontains'
                }
                if search_field in campos_map:
                    lookup = campos_map[search_field]
                    queryset = queryset.filter(**{lookup: search_value})

        ativo_param = self.request.query_params.get('ativo')
        if ativo_param is not None:
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
        'nome', 'ferramenta__nome', 'ferramenta__numero_serie', 
        'tipo', 'data_inicio', 'data_fim', 'observacoes'
    ]

    def get_queryset(self):
        user = self.request.user
        queryset = Manutencao.objects.all().order_by('-data_inicio')

        if user.tipo == 'COORDENADOR':
            queryset = queryset.filter(ferramenta__deposito__filial__in=user.filiais.all())

        search_field = self.request.query_params.get('search_field')
        search_value = self.request.query_params.get('search_value')

        if search_field and search_value:
            if search_field in ['data_inicio', 'data_fim'] and '/' in search_value:
                try:
                    partes = search_value.split('/')
                    if len(partes) == 3:
                        dia, mes, ano = partes
                        filtro = {}
                        if dia.lower() != 'xx': filtro[f'{search_field}__day'] = int(dia)
                        if mes.lower() != 'xx': filtro[f'{search_field}__month'] = int(mes)
                        if ano.lower() != 'xxxx': filtro[f'{search_field}__year'] = int(ano)
                        queryset = queryset.filter(**filtro)
                except ValueError: pass

            elif search_field == 'tipo':
                queryset = queryset.filter(tipo__iexact=search_value)

            else:
                campos_map = {
                    'nome': 'nome__icontains',
                    'ferramenta': 'ferramenta__nome__icontains',
                    'serial': 'ferramenta__numero_serie__icontains',
                    'observacoes': 'observacoes__icontains'
                }
                if search_field in campos_map:
                    lookup = campos_map[search_field]
                    queryset = queryset.filter(**{lookup: search_value})

        ativo_param = self.request.query_params.get('ativo')
        if ativo_param is not None:
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