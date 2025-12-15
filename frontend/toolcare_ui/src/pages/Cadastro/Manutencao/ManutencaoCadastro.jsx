import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './manutencao_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const ManutencaoCadastro = () => {
    // Estado do formulário com o novo campo observacoes
    const [formData, setFormData] = useState({
        ferramenta: '',
        tipo: '', // PREVENTIVA ou CORRETIVA
        data_inicio: new Date().toISOString().split('T')[0], // Inicia com data de hoje
        observacoes: ''
    });

    const [ferramentas, setFerramentas] = useState([]);
    
    // Controle visual da data (Text -> Date -> Text)
    const [inputType, setInputType] = useState('text');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadFerramentas = async () => {
            try {
                const response = await api.get('/api/ferramentas/');
                // REGRA: Só mostra ferramentas disponíveis
                // O backend pode já filtrar, mas garantimos aqui
                const disponiveis = response.data.filter(f => f.estado === 'DISPONIVEL');
                setFerramentas(disponiveis);
            } catch (error) {
                console.error("Erro ao carregar ferramentas:", error);
            }
        };
        loadFerramentas();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Formata a data ISO (yyyy-mm-dd) para BR (dd/mm/yyyy) apenas para exibição
    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await api.post('/api/manutencoes/', formData);
            
            console.log("Manutenção iniciada:", response.data);

            setShowSuccess(true);
            setShowError(false);
            
            // Limpa o formulário
            setFormData({
                ferramenta: '',
                tipo: '',
                data_inicio: new Date().toISOString().split('T')[0],
                observacoes: ''
            });
            setInputType('text');

            // Remove a ferramenta da lista visualmente (pois agora está EM_MANUTENCAO)
            setFerramentas(ferramentas.filter(f => f.id !== response.data.ferramenta));

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Erro:', error);
            setMsgErro(error.response?.data?.detail || "Erro ao cadastrar manutenção");
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/manutencoes">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_manutencao_form}
                >
                    <p id={styles.cadastro}>Nova Manutenção</p>
                    
                    {/* Select de Ferramenta */}
                    <select
                        name="ferramenta"
                        value={formData.ferramenta}
                        onChange={handleChange}
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

                    {/* Select de Tipo */}
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                        className={styles.selectInput}
                    >
                        <option value="" disabled>Tipo de Manutenção</option>
                        <option value="PREVENTIVA">Preventiva</option>
                        <option value="CORRETIVA">Corretiva</option>
                    </select>
                    
                    {/* Legenda Data */}
                    <label className={styles.inputLabel}>Data de Início:</label>

                    {/* Input de Data */}
                    <input
                        type={inputType}
                        name='data_inicio' 
                        required
                        placeholder='Data de Início'
                        onFocus={() => setInputType('date')}
                        onBlur={() => setInputType('text')}
                        value={inputType === 'date' ? formData.data_inicio : formatDateToDisplay(formData.data_inicio)}
                        onChange={handleChange}
                        className={styles.dateInput}
                    />

                    {/* Área de Observações (Novo Campo) */}
                    <textarea
                        name="observacoes"
                        placeholder="Observações (Opcional)"
                        value={formData.observacoes}
                        onChange={handleChange}
                        className={styles.textArea}
                        rows="3"
                        style={{ marginTop: '1.5rem' }}
                    ></textarea>
                    
                    <button id={styles.enviar} type='submit'>
                        INICIAR MANUTENÇÃO
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent />}
            </div>
        </div>
    );
};

export default ManutencaoCadastro;