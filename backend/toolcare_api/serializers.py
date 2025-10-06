# backend/toolcare_api/serializers.py

from rest_framework import serializers
from .models import Setor, Cargo, Funcionario

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'  # Inclui todos os campos do modelo (id, nome_setor, etc)

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'

class FuncionarioSerializer(serializers.ModelSerializer):
    # Estes campos permitem mostrar os nomes do setor e cargo, em vez de apenas seus IDs.
    # O 'read_only=True' significa que eles são apenas para leitura (GET).
    setor_nome = serializers.CharField(source='setor.nome_setor', read_only=True)
    cargo_nome = serializers.CharField(source='cargo.nome_cargo', read_only=True)

    class Meta:
        model = Funcionario
        # Listamos todos os campos que queremos na nossa API.
        fields = [
            'id', 
            'nome', 
            'matricula', 
            'cpf', 
            'setor',      # Usado para escrever (POST/PUT), espera um ID
            'setor_nome', # Usado para ler (GET)
            'cargo',      # Usado para escrever (POST/PUT), espera um ID
            'cargo_nome', # Usado para ler (GET)
            'foto', 
            'ativo'
        ]