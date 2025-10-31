from rest_framework import viewsets
from .models import Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from .serializers import FilialSerializer, DepositoSerializer, SetorSerializer, CargoSerializer, FuncionarioSerializer, FerramentaSerializer, EmprestimoSerializer, ManutencaoSerializer

class FilialViewSet(viewsets.ModelViewSet):
    queryset = Filial.objects.all().order_by('nome')
    serializer_class = FilialSerializer

class DepositoViewSet(viewsets.ModelViewSet):
    queryset = Deposito.objects.all().order_by('nome')
    serializer_class = DepositoSerializer

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all().order_by('nome_setor')
    serializer_class = SetorSerializer

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all().order_by('nome_cargo')
    serializer_class = CargoSerializer

class FuncionarioViewSet(viewsets.ModelViewSet):
    queryset = Funcionario.objects.all().order_by('nome')
    serializer_class = FuncionarioSerializer

class FerramentaViewSet(viewsets.ModelViewSet):
    queryset = Ferramenta.objects.all().order_by('nome')
    serializer_class = FerramentaSerializer

class EmprestimoViewSet(viewsets.ModelViewSet):
    queryset = Emprestimo.objects.all().order_by('-data_emprestimo')
    serializer_class = EmprestimoSerializer

class ManutencaoViewSet(viewsets.ModelViewSet):
    queryset = Manutencao.objects.all().order_by('-data_inicio')
    serializer_class = ManutencaoSerializer