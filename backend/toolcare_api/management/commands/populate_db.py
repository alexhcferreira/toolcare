import random
from django.core.management.base import BaseCommand
from faker import Faker
from toolcare_api.models import Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from datetime import date

class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de teste multi-filial'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando povoamento multi-filial...'))

        filial_a, _ = Filial.objects.get_or_create(nome='Usina São Paulo', defaults={'cidade': 'Sertãozinho'})
        filial_b, _ = Filial.objects.get_or_create(nome='Usina Minas Gerais', defaults={'cidade': 'Uberaba'})
        deposito_a1, _ = Deposito.objects.get_or_create(nome='Depósito Principal SP', defaults={'filial': filial_a})
        deposito_a2, _ = Deposito.objects.get_or_create(nome='Depósito Campo SP', defaults={'filial': filial_a})
        deposito_b1, _ = Deposito.objects.get_or_create(nome='Depósito Principal MG', defaults={'filial': filial_b})
        self.stdout.write(self.style.SUCCESS('Filiais e Depósitos criados.'))

        setores_data = [
            {'nome_setor': 'Manutenção', 'descricao_setor': 'Setor de manutenção geral'},
            {'nome_setor': 'Produção', 'descricao_setor': 'Linha de produção principal'},
            {'nome_setor': 'Almoxarifado', 'descricao_setor': 'Controle de estoque e ferramentas'},
            {'nome_setor': 'RH', 'descricao_setor': 'Recursos Humanos'},
        ]
        cargos_data = [
            {'nome_cargo': 'Mecânico de Manutenção', 'descricao_cargo': 'Responsável pela manutenção mecânica'},
            {'nome_cargo': 'Eletricista', 'descricao_cargo': 'Responsável pela manutenção elétrica'},
            {'nome_cargo': 'Operador de Máquinas', 'descricao_cargo': 'Opera as máquinas da produção'},
            {'nome_cargo': 'Almoxarife', 'descricao_cargo': 'Controla o estoque'},
        ]
        setores = [Setor.objects.get_or_create(**data)[0] for data in setores_data]
        cargos = [Cargo.objects.get_or_create(**data)[0] for data in cargos_data]
        self.stdout.write(self.style.SUCCESS(f'Setores e Cargos criados.'))
        
        fake = Faker('pt_BR')
        filiais = [filial_a, filial_b]
        for i in range(10):
            func, created = Funcionario.objects.get_or_create(
                cpf=fake.cpf().replace('.', '').replace('-', ''),
                defaults={ 
                    'nome': fake.name(), 
                    'matricula': str(1000 + i), 
                    'setor': random.choice(setores), 
                    'cargo': random.choice(cargos), 
                }
            )
            if created:
                func.filiais.set(random.sample(filiais, k=random.randint(1, len(filiais))))
        self.stdout.write(self.style.SUCCESS('10 funcionários criados e associados a filiais.'))

        depositos = [deposito_a1, deposito_a2, deposito_b1]
        ferramentas_data = [
            {'nome': 'Martelo de Bola', 'numero_serie': 'SN-MT001', 'data_aquisicao': date(2023, 1, 15)},
            {'nome': 'Chave de Fenda Phillips', 'numero_serie': 'SN-CF002', 'data_aquisicao': date(2023, 1, 20)},
            {'nome': 'Alicate Universal', 'numero_serie': 'SN-AL003', 'data_aquisicao': date(2023, 2, 10)},
            {'nome': 'Furadeira de Impacto', 'numero_serie': 'SN-FU004', 'data_aquisicao': date(2023, 3, 5)},
            {'nome': 'Multímetro Digital', 'numero_serie': 'SN-MM005', 'data_aquisicao': date(2023, 4, 1)},
            {'nome': 'Torquímetro de Estalo', 'numero_serie': 'SN-TQ006', 'data_aquisicao': date(2023, 5, 20)},
        ]
        for data in ferramentas_data:
            Ferramenta.objects.get_or_create(numero_serie=data['numero_serie'], defaults={**data, 'deposito': random.choice(depositos)})
        self.stdout.write(self.style.SUCCESS(f'Ferramentas criadas e associadas a depósitos.'))
        
        funcionarios = list(Funcionario.objects.all())
        ferramentas_disponiveis = list(Ferramenta.objects.filter(estado=Ferramenta.EstadoChoices.DISPONIVEL))
        
        num_emprestimos = 2
        for _ in range(num_emprestimos):
            if funcionarios and ferramentas_disponiveis:
                funcionario_aleatorio = random.choice(funcionarios)
                ferramenta_aleatoria = random.choice(ferramentas_disponiveis)
                Emprestimo.objects.create(
                    funcionario=funcionario_aleatorio,
                    ferramenta=ferramenta_aleatoria
                )
                ferramentas_disponiveis.remove(ferramenta_aleatoria)
        self.stdout.write(self.style.SUCCESS(f'{num_emprestimos} empréstimos criados.'))

        num_manutencoes = 2
        for _ in range(num_manutencoes):
            if ferramentas_disponiveis:
                ferramenta_aleatoria = random.choice(ferramentas_disponiveis)
                Manutencao.objects.create(
                    ferramenta=ferramenta_aleatoria,
                    tipo=random.choice(Manutencao.TipoChoices.values)
                )
                ferramentas_disponiveis.remove(ferramenta_aleatoria)
        self.stdout.write(self.style.SUCCESS(f'{num_manutencoes} manutenções criadas.'))

        self.stdout.write(self.style.SUCCESS('Povoamento do banco de dados concluído!'))