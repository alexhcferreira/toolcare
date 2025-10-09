# backend/toolcare_api/management/commands/populate_db.py

import random
from django.core.management.base import BaseCommand
from faker import Faker
from toolcare_api.models import Setor, Cargo, Funcionario, Ferramenta, Emprestimo

class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de teste'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando o povoamento do banco de dados...'))

        self.stdout.write('Criando Setores e Cargos...')
        setores_data = [ {'nome_setor': 'Manutenção', 'descricao_setor': 'Setor de manutenção geral'}, {'nome_setor': 'Produção', 'descricao_setor': 'Linha de produção principal'}, {'nome_setor': 'Almoxarifado', 'descricao_setor': 'Controle de estoque e ferramentas'}, {'nome_setor': 'RH', 'descricao_setor': 'Recursos Humanos'}, ]
        cargos_data = [ {'nome_cargo': 'Mecânico de Manutenção', 'descricao_cargo': 'Responsável pela manutenção mecânica'}, {'nome_cargo': 'Eletricista', 'descricao_cargo': 'Responsável pela manutenção elétrica'}, {'nome_cargo': 'Operador de Máquinas', 'descricao_cargo': 'Opera as máquinas da produção'}, {'nome_cargo': 'Almoxarife', 'descricao_cargo': 'Controla o estoque'}, ]
        setores = [Setor.objects.get_or_create(**data)[0] for data in setores_data]
        cargos = [Cargo.objects.get_or_create(**data)[0] for data in cargos_data]
        self.stdout.write(self.style.SUCCESS(f'{len(setores)} setores e {len(cargos)} cargos criados.'))
        
        self.stdout.write('Criando Funcionários...')
        fake = Faker('pt_BR')
        for i in range(10):
            Funcionario.objects.get_or_create( cpf=fake.cpf().replace('.', '').replace('-', ''), defaults={ 'nome': fake.name(), 'matricula': str(1000 + i), 'setor': random.choice(setores), 'cargo': random.choice(cargos), } )
        self.stdout.write(self.style.SUCCESS('10 funcionários criados.'))
        
        self.stdout.write('Criando Ferramentas...')
        ferramentas_data = [
            {'nome': 'Martelo de Bola', 'numero_serie': 'SN-MT001', 'data_aquisicao': '2023-01-15'},
            {'nome': 'Chave de Fenda Phillips', 'numero_serie': 'SN-CF002', 'data_aquisicao': '2023-01-20'},
            {'nome': 'Alicate Universal', 'numero_serie': 'SN-AL003', 'data_aquisicao': '2023-02-10'},
            {'nome': 'Furadeira de Impacto', 'numero_serie': 'SN-FU004', 'data_aquisicao': '2023-03-05'},
            {'nome': 'Multímetro Digital', 'numero_serie': 'SN-MM005', 'data_aquisicao': '2023-04-01'},
            {'nome': 'Torquímetro de Estalo', 'numero_serie': 'SN-TQ006', 'data_aquisicao': '2023-05-20'},
        ]

        for data in ferramentas_data:
            Ferramenta.objects.get_or_create(numero_serie=data['numero_serie'], defaults=data)
        self.stdout.write(self.style.SUCCESS(f'{len(ferramentas_data)} ferramentas criadas.'))

        self.stdout.write('Criando Empréstimos...')
        funcionarios = list(Funcionario.objects.all())
        ferramentas_disponiveis = list(Ferramenta.objects.filter(estado=Ferramenta.EstadoChoices.DISPONIVEL))
        for _ in range(3):
            if funcionarios and ferramentas_disponiveis:
                funcionario_aleatorio = random.choice(funcionarios)
                ferramenta_aleatoria = random.choice(ferramentas_disponiveis)
                Emprestimo.objects.create( funcionario=funcionario_aleatorio, ferramenta=ferramenta_aleatoria, observacoes='Empréstimo de teste gerado pelo sistema.' )
                ferramentas_disponiveis.remove(ferramenta_aleatoria)
        self.stdout.write(self.style.SUCCESS('3 empréstimos criados.'))
        self.stdout.write(self.style.SUCCESS('Povoamento do banco de dados concluído com sucesso!'))