import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from toolcare_api.models import Usuario, Filial, Deposito, Setor, Cargo, Funcionario, Ferramenta, Emprestimo, Manutencao
from datetime import timedelta, date

class Command(BaseCommand):
    help = 'Popula o banco com dados consistentes e usuários definidos (0, 00, 1..9).'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- INICIANDO POVOAMENTO CONTROLADO ---'))
        fake = Faker('pt_BR')
        senha_padrao = "123"

        # 1. LIMPEZA TOTAL
        self.stdout.write('Limpando banco de dados...')
        Emprestimo.objects.all().delete()
        Manutencao.objects.all().delete()
        Ferramenta.objects.all().delete()
        Funcionario.objects.all().delete()
        Deposito.objects.all().delete()
        Filial.objects.all().delete()
        Setor.objects.all().delete()
        Cargo.objects.all().delete()
        Usuario.objects.all().delete()
        
        with transaction.atomic():
            # 2. ESTRUTURA BÁSICA (Filiais, Depósitos, Setores, Cargos)
            filiais = [
                Filial.objects.create(nome='Usina São Paulo', cidade='Sertãozinho'),
                Filial.objects.create(nome='Usina Minas Gerais', cidade='Uberaba'),
                Filial.objects.create(nome='Usina Bahia', cidade='Luís Eduardo Magalhães'),
                Filial.objects.create(nome='Usina Goiás', cidade='Rio Verde'),
            ]

            depositos = []
            for filial in filiais:
                depositos.append(Deposito.objects.create(nome=f'Almoxarifado Central', filial=filial))
                depositos.append(Deposito.objects.create(nome=f'Depósito de Campo', filial=filial))
                depositos.append(Deposito.objects.create(nome=f'Depósito Manutenção', filial=filial))

            setores = [Setor.objects.create(nome_setor=n) for n in ['Manutenção', 'Elétrica', 'Produção', 'Usinagem', 'Caldeiraria', 'Logística', 'TI']]
            cargos = [Cargo.objects.create(nome_cargo=n) for n in ['Mecânico', 'Eletricista', 'Soldador', 'Torneiro', 'Ajudante', 'Supervisor', 'Engenheiro']]

            self.stdout.write(self.style.SUCCESS('Estrutura base criada.'))

            # 3. CRIAÇÃO DOS USUÁRIOS ESPECÍFICOS
            # Lista de definição conforme seu pedido
            usuarios_para_criar = [
                # MÁXIMOS
                {'cpf': '0',  'nome': 'Máximo Principal', 'tipo': 'MAXIMO'},
                {'cpf': '00', 'nome': 'Máximo Secundário', 'tipo': 'MAXIMO'},
                
                # ADMS
                {'cpf': '1', 'nome': 'Administrador 1', 'tipo': 'ADMINISTRADOR'},
                {'cpf': '2', 'nome': 'Administrador 2', 'tipo': 'ADMINISTRADOR'},
                {'cpf': '3', 'nome': 'Administrador 3', 'tipo': 'ADMINISTRADOR'},
                
                # COORDENADORES (Devem ter filiais)
                {'cpf': '4', 'nome': 'Coord. Sertãozinho', 'tipo': 'COORDENADOR'},
                {'cpf': '5', 'nome': 'Coord. Uberaba',     'tipo': 'COORDENADOR'},
                {'cpf': '6', 'nome': 'Coord. Bahia',       'tipo': 'COORDENADOR'},
                {'cpf': '7', 'nome': 'Coord. Goiás',       'tipo': 'COORDENADOR'},
                {'cpf': '8', 'nome': 'Coord. Multilocal A', 'tipo': 'COORDENADOR'},
                {'cpf': '9', 'nome': 'Coord. Multilocal B', 'tipo': 'COORDENADOR'},
            ]

            for u_data in usuarios_para_criar:
                user = Usuario.objects.create_user(
                    cpf=u_data['cpf'],
                    nome=u_data['nome'],
                    tipo=u_data['tipo'],
                    password=senha_padrao
                )
                
                # Se for coordenador, associa a filiais
                if u_data['tipo'] == 'COORDENADOR':
                    # Distribuição lógica para garantir que todos tenham filial
                    if u_data['cpf'] == '4': user.filiais.add(filiais[0]) # SP
                    elif u_data['cpf'] == '5': user.filiais.add(filiais[1]) # MG
                    elif u_data['cpf'] == '6': user.filiais.add(filiais[2]) # BA
                    elif u_data['cpf'] == '7': user.filiais.add(filiais[3]) # GO
                    elif u_data['cpf'] == '8': 
                        user.filiais.add(filiais[0])
                        user.filiais.add(filiais[1])
                    elif u_data['cpf'] == '9': 
                        user.filiais.set(filiais) # Todas

            self.stdout.write(self.style.SUCCESS('Usuários 0 a 9 criados e configurados.'))

            # 4. FUNCIONÁRIOS (200)
            funcionarios = []
            for i in range(200):
                f_filial = random.choice(filiais)
                func = Funcionario.objects.create(
                    nome=fake.name(),
                    matricula=str(10000 + i),
                    cpf=fake.cpf(),
                    setor=random.choice(setores),
                    cargo=random.choice(cargos)
                )
                func.filiais.add(f_filial)
                if random.random() > 0.9: # 10% de chance de ter 2 filiais
                    func.filiais.add(random.choice(filiais))
                funcionarios.append(func)
            
            self.stdout.write(self.style.SUCCESS('200 Funcionários criados.'))

            # 5. FERRAMENTAS (500)
            lista_nomes = ['Furadeira', 'Parafusadeira', 'Lixadeira', 'Martelete', 'Serra Circular', 'Alicate de Pressão', 'Chave de Impacto', 'Multímetro', 'Esmerilhadeira', 'Talha']
            ferramentas = []
            
            for i in range(500):
                deposito = random.choice(depositos)
                nome = f"{random.choice(lista_nomes)} {fake.color_name().capitalize()}"
                ferramenta = Ferramenta.objects.create(
                    nome=nome,
                    numero_serie=f"SN-{i:04d}",
                    descricao=fake.sentence(),
                    data_aquisicao=fake.date_between(start_date='-4y', end_date='today'),
                    deposito=deposito,
                    estado='DISPONIVEL'
                )
                ferramentas.append(ferramenta)
            
            self.stdout.write(self.style.SUCCESS('500 Ferramentas criadas.'))

            # 6. DISTRIBUIÇÃO DE TRANSAÇÕES
            # Embaralha para pegar aleatórias
            random.shuffle(ferramentas)

            # Fatias (Slices) para garantir consistência (uma ferramenta não pode estar em 2 estados)
            grupo_emp_ativo = ferramentas[0:40]      # 40 Ferramentas -> Serão EMPRESTADAS
            grupo_man_ativa = ferramentas[40:55]     # 15 Ferramentas -> Serão EM MANUTENÇÃO
            grupo_historico = ferramentas[55:155]    # 100 Ferramentas -> Terão histórico (mas estarão DISPONIVEIS agora)
            # As outras 330 ficam paradas no depósito (DISPONIVEL)
            
            # A. EMPRÉSTIMOS ATIVOS
            count_emp = 0
            for ferr in grupo_emp_ativo:
                filiais_da_ferramenta = [ferr.deposito.filial]
                # Acha funcionário da MESMA filial da ferramenta
                funcs_compativeis = [f for f in funcionarios if any(fil in f.filiais.all() for fil in filiais_da_ferramenta)]
                
                if funcs_compativeis:
                    func = random.choice(funcs_compativeis)
                    Emprestimo.objects.create(
                        ferramenta=ferr,
                        funcionario=func,
                        data_emprestimo=date.today() - timedelta(days=random.randint(1, 10)),
                        ativo=True,
                        observacoes="Uso contínuo em obra.",
                        nome=f"Empréstimo Ativo {count_emp}"
                    )
                    ferr.estado = 'EMPRESTADA'
                    ferr.save()
                    count_emp += 1

            # B. MANUTENÇÕES ATIVAS
            count_man = 0
            for ferr in grupo_man_ativa:
                Manutencao.objects.create(
                    ferramenta=ferr,
                    tipo=random.choice(['PREVENTIVA', 'CORRETIVA']),
                    data_inicio=date.today() - timedelta(days=random.randint(1, 5)),
                    ativo=True,
                    observacoes="Aguardando peça de reposição.",
                    nome=f"Manutenção Ativa {count_man}"
                )
                ferr.estado = 'EM_MANUTENCAO'
                ferr.save()
                count_man += 1

            # C. HISTÓRICO (Empréstimos e Manutenções já finalizados)
            # Usamos o 'grupo_historico', que são ferramentas que estão DISPONIVEIS agora,
            # mas vamos criar registros antigos com ativo=False para elas.
            for i, ferr in enumerate(grupo_historico):
                # 1. Cria um empréstimo antigo
                filiais_da_ferramenta = [ferr.deposito.filial]
                funcs_compativeis = [f for f in funcionarios if any(fil in f.filiais.all() for fil in filiais_da_ferramenta)]
                
                if funcs_compativeis:
                    func = random.choice(funcs_compativeis)
                    dt_inicio = fake.date_between(start_date='-1y', end_date='-60d')
                    dt_fim = dt_inicio + timedelta(days=random.randint(1, 5))
                    
                    emp = Emprestimo.objects.create(
                        ferramenta=ferr,
                        funcionario=func,
                        data_emprestimo=dt_inicio,
                        ativo=True, # Cria ativo para linkar
                        nome=f"Emp. Histórico {i}"
                    )
                    # Finaliza para gerar o snapshot
                    emp.data_devolucao = dt_fim
                    emp.ativo = False
                    emp.save()

                # 2. Cria uma manutenção antiga (para a mesma ferramenta, em data diferente)
                dt_man_inicio = fake.date_between(start_date='-50d', end_date='-10d')
                dt_man_fim = dt_man_inicio + timedelta(days=2)
                
                man = Manutencao.objects.create(
                    ferramenta=ferr,
                    tipo='PREVENTIVA',
                    data_inicio=dt_man_inicio,
                    ativo=True,
                    nome=f"Manut. Histórico {i}"
                )
                man.data_fim = dt_man_fim
                man.ativo = False
                man.save()
                
                # Garante que no final ela está disponivel
                ferr.estado = 'DISPONIVEL'
                ferr.save()

        # 8. IMPRESSÃO DA LISTA (Corrigido erro de formatação)
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS(f'--- LISTA DE USUÁRIOS (Senha: {senha_padrao}) ---'))
        self.stdout.write(f"{'TIPO':<15} | {'LOGIN (CPF)':<15} | {'NOME'}")
        self.stdout.write('-'*60)

        todos_usuarios = Usuario.objects.all().order_by('tipo', 'nome')

        for u in todos_usuarios:
            # Convertendo CPF para string para evitar erro de formatação
            cpf_str = str(u.cpf) 
            self.stdout.write(f"{u.tipo:<15} | {cpf_str:<15} | {u.nome}")

        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('POVOAMENTO CONCLUÍDO COM SUCESSO!'))