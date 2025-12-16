import random
from django.core.management.base import BaseCommand
from faker import Faker
from toolcare_api.models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Popula o banco de dados com uma grande quantidade de dados de teste realistas para uma usina.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- INICIANDO POVOAMENTO EM LARGA ESCALA ---'))

        # 1. LIMPEZA DO BANCO DE DADOS
        self.stdout.write('Limpando dados antigos...')
        Emprestimo.objects.all().delete()
        Manutencao.objects.all().delete()
        Ferramenta.objects.all().delete()
        Funcionario.objects.all().delete()
        Deposito.objects.all().delete()
        Filial.objects.all().delete()
        Setor.objects.all().delete()
        Cargo.objects.all().delete()
        Usuario.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Banco de dados limpo.'))

        # 2. CRIAÇÃO DA ESTRUTURA ORGANIZACIONAL
        fake = Faker('pt_BR')
        filiais = [
            Filial.objects.get_or_create(nome='Usina São Paulo', defaults={'cidade': 'Sertãozinho'})[0],
            Filial.objects.get_or_create(nome='Usina Minas Gerais', defaults={'cidade': 'Uberaba'})[0],
            Filial.objects.get_or_create(nome='Usina Bahia', defaults={'cidade': 'Luís Eduardo Magalhães'})[0],
            Filial.objects.get_or_create(nome='Usina Goiás', defaults={'cidade': 'Rio Verde'})[0],
        ]
        
        depositos = []
        for filial in filiais:
            depositos.append(Deposito.objects.get_or_create(nome=f'Depósito Principal {filial.cidade}', filial=filial)[0])
            depositos.append(Deposito.objects.get_or_create(nome=f'Almoxarifado Mecânica {filial.cidade}', filial=filial)[0])
        
        setores = [Setor.objects.get_or_create(nome_setor=n)[0] for n in ['Manutenção Automotiva', 'Manutenção Industrial', 'Elétrica', 'Instrumentação', 'Produção', 'Almoxarifado', 'RH']]
        cargos = [Cargo.objects.get_or_create(nome_cargo=n)[0] for n in ['Mecânico', 'Eletricista', 'Soldador', 'Operador de Máquinas', 'Almoxarife', 'Torneiro Mecânico', 'Instrumentista']]
        self.stdout.write(self.style.SUCCESS('Estrutura (Filiais, Depósitos, Setores, Cargos) criada.'))

        # 3. CRIAÇÃO DE USUÁRIOS COM REGRAS ESPECÍFICAS
        logins = []
        senha_padrao = "123"

        # 1 Usuário Máximo
        cpf_max = fake.cpf()
        user_max, _ = Usuario.objects.get_or_create(cpf=cpf_max, defaults={'nome': 'Usuário Máximo Global', 'tipo': 'MAXIMO'})
        user_max.set_password(senha_padrao)
        user_max.save()
        logins.append({'tipo': 'MAXIMO', 'cpf': cpf_max, 'senha': senha_padrao})

        # 2 Administradores
        for i in range(2):
            cpf_admin = fake.cpf()
            user_admin, _ = Usuario.objects.get_or_create(cpf=cpf_admin, defaults={'nome': f'Administrador {i+1}', 'tipo': 'ADMINISTRADOR'})
            user_admin.set_password(senha_padrao)
            user_admin.save()
            logins.append({'tipo': 'ADMIN', 'cpf': cpf_admin, 'senha': senha_padrao})

        # 8 Coordenadores
        for i in range(8):
            cpf_coord = fake.cpf()
            coord, created = Usuario.objects.get_or_create(cpf=cpf_coord, defaults={'nome': f'Coordenador {i+1}', 'tipo': 'COORDENADOR'})
            coord.set_password(senha_padrao)
            if created:
                # Associa a 1 ou 2 filiais aleatórias
                filiais_coord = random.sample(filiais, k=random.randint(1, 2))
                coord.filiais.set(filiais_coord)
            coord.save()
            logins.append({'tipo': 'COORD', 'cpf': cpf_coord, 'senha': senha_padrao})
            
        self.stdout.write(self.style.SUCCESS('Usuários (Máximo, Admins, Coordenadores) criados.'))

        # 4. CRIAÇÃO DE FUNCIONÁRIOS
        for i in range(150):
            func, created = Funcionario.objects.get_or_create(
                matricula=str(1000 + i),
                defaults={ 
                    'nome': fake.name(), 
                    'cpf': fake.cpf(),
                    'setor': random.choice(setores), 
                    'cargo': random.choice(cargos), 
                }
            )
            if created:
                func.filiais.set(random.sample(filiais, k=random.randint(1, 2)))
        self.stdout.write(self.style.SUCCESS('150 funcionários criados.'))

        # 5. CRIAÇÃO DE FERRAMENTAS
        nomes_ferramentas = ['Chave de Fenda', 'Alicate', 'Furadeira', 'Martelo', 'Torquímetro', 'Multímetro', 'Politriz', 'Serra Circular']
        modelos_ferramentas = ['Phillips', 'de Bico', 'de Impacto', 'de Bola', 'de Estalo', 'Digital', 'Angular', 'de Bancada']
        for i in range(500):
            nome = f'{random.choice(nomes_ferramentas)} {random.choice(modelos_ferramentas)}'
            Ferramenta.objects.get_or_create(
                numero_serie=f'SN-{i:04d}', 
                defaults={
                    'nome': nome, 
                    'deposito': random.choice(depositos),
                    'data_aquisicao': fake.date_between(start_date='-5y', end_date='today')
                }
            )
        self.stdout.write(self.style.SUCCESS('500 ferramentas criadas.'))

        # 6. CRIAÇÃO DE EMPRÉSTIMOS E MANUTENÇÕES ATIVAS
        ferramentas_disponiveis = list(Ferramenta.objects.filter(estado='DISPONIVEL'))
        random.shuffle(ferramentas_disponiveis)
        
        # 50 Empréstimos Ativos
        for i in range(50):
            if not ferramentas_disponiveis: break
            ferramenta = ferramentas_disponiveis.pop()
            funcionarios_da_filial = Funcionario.objects.filter(filiais=ferramenta.deposito.filial)
            if funcionarios_da_filial.exists():
                Emprestimo.objects.create(ferramenta=ferramenta, funcionario=random.choice(funcionarios_da_filial))
        
        # 20 Manutenções Ativas
        for i in range(20):
            if not ferramentas_disponiveis: break
            ferramenta = ferramentas_disponiveis.pop()
            Manutencao.objects.create(ferramenta=ferramenta, tipo=random.choice(['PREVENTIVA', 'CORRETIVA']))

        self.stdout.write(self.style.SUCCESS('50 Empréstimos e 20 Manutenções ATIVAS criados.'))

        # 7. CRIAÇÃO DE HISTÓRICO (TRANSAÇÕES INATIVAS)
        todas_ferramentas = list(Ferramenta.objects.all())
        todos_funcionarios = list(Funcionario.objects.all())
        
        # 1000 Empréstimos Históricos
        for i in range(1000):
            ferramenta = random.choice(todas_ferramentas)
            funcionario = random.choice(todos_funcionarios)
            data_emprestimo = fake.date_between(start_date='-2y', end_date='-1d')
            data_devolucao = data_emprestimo + timedelta(days=random.randint(1, 30))
            
            emp = Emprestimo.objects.create(ferramenta=ferramenta, funcionario=funcionario, data_emprestimo=data_emprestimo, data_devolucao=data_devolucao)
            emp.ativo = False
            emp.save()

        # 100 Manutenções Históricas
        for i in range(100):
            ferramenta = random.choice(todas_ferramentas)
            data_inicio = fake.date_between(start_date='-2y', end_date='-1d')
            data_fim = data_inicio + timedelta(days=random.randint(1, 15))
            
            man = Manutencao.objects.create(ferramenta=ferramenta, tipo=random.choice(['PREVENTIVA', 'CORRETIVA']), data_inicio=data_inicio, data_fim=data_fim)
            man.ativo = False
            man.save()

        self.stdout.write(self.style.SUCCESS('1000 Empréstimos e 100 Manutenções HISTÓRICAS criados.'))

        # 8. IMPRESSÃO DAS CREDENCIAIS
        self.stdout.write(self.style.SUCCESS('\n' + '='*40))
        self.stdout.write(self.style.SUCCESS('--- CREDENCIAIS DE ACESSO CRIADAS ---'))
        self.stdout.write(self.style.SUCCESS(f'--- Senha Padrão para TODOS: "{senha_padrao}" ---'))
        for login in logins:
            self.stdout.write(f"Tipo: {login['tipo']:<8} | CPF: {login['cpf']}")
        self.stdout.write(self.style.SUCCESS('='*40 + '\n'))
        self.stdout.write(self.style.SUCCESS('Povoamento do banco de dados concluído!'))