import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './emprestimo_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const EmprestimoCadastro = () => {
    const [formData, setFormData] = useState({
        ferramenta: '',
        funcionario: '',
        data_emprestimo: new Date().toISOString().split('T')[0], // Já inicia com a data de hoje
        observacoes: ''
    });

    // Listas completas vindas da API
    const [ferramentas, setFerramentas] = useState([]);
    const [todosFuncionarios, setTodosFuncionarios] = useState([]);
    
    // Lista filtrada que será exibida no select
    const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
    
    // Controle visual
    const [isFuncionarioDisabled, setIsFuncionarioDisabled] = useState(true);
    const [inputType, setInputType] = useState('text'); // Para o truque da data

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadDados = async () => {
            try {
                // Carrega ferramentas disponíveis e todos os funcionários
                // O backend já deve mandar apenas ferramentas com estado='DISPONIVEL' se configurado,
                // mas caso contrário, filtramos aqui também por segurança.
                const [ferramentasRes, funcionariosRes] = await Promise.all([
                    api.get('/api/ferramentas/'),
                    api.get('/api/funcionarios/')
                ]);

                // Garante que só mostramos ferramentas disponíveis
                const ferramentasDisponiveis = ferramentasRes.data.filter(f => f.estado === 'DISPONIVEL');
                setFerramentas(ferramentasDisponiveis);
                
                setTodosFuncionarios(funcionariosRes.data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        loadDados();
    }, []);

    // FUNÇÃO ESPECIAL: Quando seleciona a ferramenta
    const handleFerramentaChange = (event) => {
        const ferramentaId = event.target.value;
        
        // 1. Atualiza o form
        setFormData({ ...formData, ferramenta: ferramentaId, funcionario: '' }); // Reseta o funcionário
        
        // 2. Acha o objeto da ferramenta selecionada para descobrir a filial
        const ferramentaSelecionada = ferramentas.find(f => f.id.toString() === ferramentaId);

        if (ferramentaSelecionada) {
            const nomeFilialFerramenta = ferramentaSelecionada.filial_nome;

            // 3. Filtra os funcionários:
            // Só passa quem tiver a filial da ferramenta na sua lista de 'filiais_detalhes'
            const filtrados = todosFuncionarios.filter(func => 
                func.filiais_detalhes.some(filial => filial.nome === nomeFilialFerramenta)
            );

            setFuncionariosFiltrados(filtrados);
            setIsFuncionarioDisabled(false); // Habilita o campo
        } else {
            setFuncionariosFiltrados([]);
            setIsFuncionarioDisabled(true);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Formata data para exibir (dd/mm/aaaa)
    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await api.post('/api/emprestimos/', formData);
            console.log("Empréstimo realizado:", response.data);

            setShowSuccess(true);
            setShowError(false);
            
            // Reseta o form e bloqueia funcionário de novo
            setFormData({
                ferramenta: '',
                funcionario: '',
                data_emprestimo: new Date().toISOString().split('T')[0],
                observacoes: ''
            });
            setIsFuncionarioDisabled(true);
            setInputType('text');

            // Remove a ferramenta da lista visualmente (já que foi emprestada)
            setFerramentas(ferramentas.filter(f => f.id !== response.data.ferramenta));

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Erro:', error);
            setMsgErro(error.response?.data?.detail || "Erro ao realizar empréstimo");
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/emprestimos">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_emprestimo_form}
                >
                    <p id={styles.cadastro}>Novo Empréstimo</p>
                    
                    {/* Select de Ferramenta (Gatilho do Filtro) */}
                    <select
                        name="ferramenta"
                        value={formData.ferramenta}
                        onChange={handleFerramentaChange}
                        required
                        className={styles.selectInput}
                    >
                        <option value="" disabled>Selecione a Ferramenta</option>
                        {ferramentas.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.nome} - {f.numero_serie}
                            </option>
                        ))}
                    </select>

                    {/* Select de Funcionário (Dependente) */}
                    <select
                        name="funcionario"
                        value={formData.funcionario}
                        onChange={handleChange}
                        required
                        className={styles.selectInput}
                        disabled={isFuncionarioDisabled} // Fica cinza se não tiver ferramenta
                        style={{ opacity: isFuncionarioDisabled ? 0.5 : 1 }}
                    >
                        <option value="" disabled>
                            {isFuncionarioDisabled 
                                ? "Selecione uma ferramenta primeiro..." 
                                : "Selecione o Funcionário"}
                        </option>
                        
                        {funcionariosFiltrados.map(func => (
                            <option key={func.id} value={func.id}>
                                {func.nome} ({func.matricula})
                            </option>
                        ))}
                    </select>
                    
                    <label className={styles.inputLabel}>Data de Início:</label>
                    
                    <input
                        type={inputType}
                        name='data_emprestimo' 
                        required
                        // ... resto das propriedades do input ...
                        onFocus={() => setInputType('date')}
                        onBlur={() => setInputType('text')}
                        value={inputType === 'date' ? formData.data_emprestimo : formatDateToDisplay(formData.data_emprestimo)}
                        onChange={handleChange}
                        className={styles.dateInput}
                    />

                    {/* Observações */}
                    <textarea
                        name="observacoes"
                        placeholder="Observações (Opcional)"
                        value={formData.observacoes}
                        onChange={handleChange}
                        className={styles.textArea}
                        rows="3"
                    ></textarea>
                    
                    <button id={styles.enviar} type='submit'>
                        CONFIRMAR EMPRÉSTIMO
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent />}
            </div>
        </div>
    );
};

export default EmprestimoCadastro;