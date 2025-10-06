# backend/toolcare_api/views.py

from rest_framework import viewsets
from .models import Setor, Cargo, Funcionario
from .serializers import SetorSerializer, CargoSerializer, FuncionarioSerializer

class SetorViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite aos setores serem vistos ou editados.
    """
    queryset = Setor.objects.all().order_by('nome_setor')
    serializer_class = SetorSerializer

class CargoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite aos cargos serem vistos ou editados.
    """
    queryset = Cargo.objects.all().order_by('nome_cargo')
    serializer_class = CargoSerializer

class FuncionarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite aos funcionários serem vistos ou editados.
    """
    queryset = Funcionario.objects.all().order_by('nome')
    serializer_class = FuncionarioSerializer