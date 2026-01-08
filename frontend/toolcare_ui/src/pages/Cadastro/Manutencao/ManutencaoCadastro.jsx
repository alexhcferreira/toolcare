import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './manutencao_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

// 1. IMPORT DO HOOK
import { useQueryClient } from '@tanstack/react-query';

const ManutencaoCadastro = () => {
    // 2. INSTANCIAR CLIENTE
    const queryClient = useQueryClient();

    const hoje = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        ferramenta: null, 
        tipo: '', 
        data_inicio: hoje,
        observacoes: ''
    });

    // --- FILTRO DE DEPÓSITO ---
    const [depositoSelecionado, setDepositoSelecionado] = useState(null);
    const [depositosOptions, setDepositosOptions] = useState([]);

    const [todasFerramentas, setTodasFerramentas] = useState([]); // Cruas
    const [ferramentasOptions, setFerramentasOptions] = useState([]); // Formatadas
    
    const [inputType, setInputType] = useState('text');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadDados = async () => {
            try {
                const [ferramentasRes, depositosRes] = await Promise.all([
                    api.get('/api/ferramentas/'),
                    api.get('/api/depositos/')
                ]);
                
                const getList = (res) => res.data.results || res.data;

                // Salva ferramentas DISPONÍVEIS cruas
                const ferramentasDisp = getList(ferramentasRes).filter(f => f.estado === 'DISPONIVEL');
                setTodasFerramentas(ferramentasDisp);
                
                // Formata Depósitos
                setDepositosOptions(getList(depositosRes).map(d => ({
                    value: d.id,
                    label: `${d.nome} - ${d.filial_nome}`
                })));

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        loadDados();
    }, []);

    // FILTRO DE FERRAMENTAS POR DEPÓSITO
    useEffect(() => {
        let filtradas = todasFerramentas;

        if (depositoSelecionado) {
            filtradas = todasFerramentas.filter(f => f.deposito === depositoSelecionado.value);
        }

        const formatadas = filtradas.map(f => ({
            value: f.id,
            label: `${f.nome} - ${f.numero_serie}`,
            filial_nome: f.filial_nome
        }));

        setFerramentasOptions(formatadas);

        // Limpa seleção se não pertencer ao depósito
        if (formData.ferramenta && depositoSelecionado) {
            const aindaValida = filtradas.find(f => f.id === formData.ferramenta.value);
            if (!aindaValida) {
                setFormData(prev => ({ ...prev, ferramenta: null }));
            }
        }
    }, [depositoSelecionado, todasFerramentas]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

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

        if (!formData.ferramenta) {
            setMsgErro("Selecione uma ferramenta.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const payload = {
            ...formData,
            ferramenta: formData.ferramenta.value
        };

        try {
            const response = await api.post('/api/manutencoes/', payload);
            console.log("Manutenção iniciada:", response.data);

            // 3. INVALIDAR CACHE
            queryClient.invalidateQueries(['manutencoes']);

            setShowSuccess(true);
            setShowError(false);
            
            // Reset Total
            setFormData({
                ferramenta: null,
                tipo: '',
                data_inicio: hoje,
                observacoes: ''
            });
            setDepositoSelecionado(null);
            setInputType('text');

            // Atualiza lista crua removendo a ferramenta
            setTodasFerramentas(prev => prev.filter(f => f.id !== response.data.ferramenta));

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
                    
                    {/* --- SELECT DE DEPÓSITO (FILTRO OPCIONAL) --- */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Filtrar por Depósito <span style={{color:'#888', fontSize:'1.2rem'}}>(Opcional)</span>
                        </label>
                        <Select
                            placeholder="Todos os depósitos"
                            noOptionsMessage={() => "Nenhum depósito encontrado"}
                            styles={customSelectStyles} 
                            options={depositosOptions}
                            value={depositoSelecionado}
                            onChange={setDepositoSelecionado}
                            isClearable 
                        />
                    </div>

                    {/* SELECT DE FERRAMENTA */}
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

                    {/* SELECT DE TIPO */}
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