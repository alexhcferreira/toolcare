# backend/toolcare_api/views.py

from rest_framework import viewsets
from .models import Setor, Cargo, Funcionario, Ferramenta, Emprestimo
from .serializers import SetorSerializer, CargoSerializer, FuncionarioSerializer, FerramentaSerializer, EmprestimoSerializer

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
    queryset = Emprestimo.objects.all().order_by('-data_emprestimo') # Ordena pelos mais recentes
    serializer_class = EmprestimoSerializer