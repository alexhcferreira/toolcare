import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './manutencao_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

// 1. IMPORTS DO REACT-SELECT
import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

const ManutencaoCadastro = () => {
    const hoje = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        ferramenta: null, // Agora é um objeto do react-select
        tipo: '', 
        data_inicio: hoje,
        observacoes: ''
    });

    const [ferramentasOptions, setFerramentasOptions] = useState([]); // Opções formatadas
    const [inputType, setInputType] = useState('text');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadFerramentas = async () => {
            try {
                const response = await api.get('/api/ferramentas/');
                
                // 2. FILTRAR E FORMATAR PARA O REACT-SELECT
                const formatados = response.data
                    .filter(f => f.estado === 'DISPONIVEL')
                    .map(f => ({
                        value: f.id,
                        label: `${f.nome} - ${f.numero_serie}`
                    }));
                
                setFerramentasOptions(formatados);
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

    // 3. HANDLER ESPECÍFICO PARA FERRAMENTA
    const handleFerramentaChange = (selectedOption) => {
        setFormData({ ...formData, ferramenta: selectedOption });
    };

    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validação manual
        if (!formData.ferramenta) {
            setMsgErro("Selecione uma ferramenta.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        // 4. PREPARAR DADOS (Extrair ID)
        const payload = {
            ...formData,
            ferramenta: formData.ferramenta.value
        };

        try {
            const response = await api.post('/api/manutencoes/', payload);
            
            console.log("Manutenção iniciada:", response.data);

            setShowSuccess(true);
            setShowError(false);
            
            // Reset
            setFormData({
                ferramenta: null,
                tipo: '',
                data_inicio: hoje,
                observacoes: ''
            });
            setInputType('text');

            // Remove a ferramenta da lista de opções (pois agora está EM_MANUTENCAO)
            setFerramentasOptions(prev => prev.filter(f => f.value !== response.data.ferramenta));

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
                    
                    {/* SELECT DE FERRAMENTA (COM PESQUISA) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Ferramenta <span className={styles.asterisk}>*</span>
                        </label>
                        <Select
                            placeholder="Pesquise a ferramenta..."
                            noOptionsMessage={() => "Nenhuma ferramenta disponível"}
                            styles={customSelectStyles}
                            options={ferramentasOptions}
                            value={formData.ferramenta}
                            onChange={handleFerramentaChange}
                            isClearable
                            required
                        />
                    </div>

                    {/* SELECT DE TIPO (NATIVO - Mantido como estava) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Tipo <span className={styles.asterisk}>*</span>
                        </label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                            className={`${styles.selectInput} ${formData.tipo === "" ? styles.emptySelect : ""}`}
                        >
                            <option value="">Selecione o tipo</option>
                            <option value="PREVENTIVA">Preventiva</option>
                            <option value="CORRETIVA">Corretiva</option>
                        </select>
                    </div>
                    
                    {/* Data de Início */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Data de Início <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type={inputType}
                            name='data_inicio' 
                            required
                            placeholder='Selecione a data'
                            onFocus={() => setInputType('date')}
                            onBlur={() => setInputType('text')}
                            value={inputType === 'date' ? formData.data_inicio : formatDateToDisplay(formData.data_inicio)}
                            onChange={handleChange}
                            className={styles.dateInput}
                        />
                    </div>

                    {/* Observações */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Observações</label>
                        <textarea
                            name="observacoes"
                            placeholder="Descreva o problema ou procedimento"
                            value={formData.observacoes}
                            onChange={handleChange}
                            className={styles.textArea}
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <button id={styles.enviar} type='submit'>
                        INICIAR MANUTENÇÃO
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent message={msgErro} />}
            </div>
        </div>
    );
};

export default ManutencaoCadastro;