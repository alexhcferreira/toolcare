import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './deposito_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

// 1. IMPORTS DO REACT-SELECT
import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

const DepositoCadastro = () => {
    const [formData, setFormData] = useState({
        nome: '',
        filial: null // Objeto { value, label }
    });

    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                
                // 2. FORMATAÇÃO: NOME - CIDADE
                const formatados = response.data.map(f => ({
                    value: f.id,
                    label: `${f.nome} - ${f.cidade}`
                }));
                
                setFiliaisOptions(formatados);
            } catch (error) {
                console.error("Erro ao carregar filiais:", error);
            }
        };
        loadFiliais();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. HANDLER ESPECÍFICO PARA O SELECT
    const handleFilialChange = (selectedOption) => {
        setFormData({ ...formData, filial: selectedOption });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validação manual
        if (!formData.filial) {
            setMsgErro("Selecione uma filial.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const dataToSend = {
            nome: formData.nome,
            filial: formData.filial.value // Extrai o ID
        };

        try {
            const response = await api.post('/api/depositos/', dataToSend);
            
            console.log("Depósito cadastrado com sucesso:", response.data);

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome: '', filial: null }); 
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            const msg = error.response?.data?.detail || 
                        (error.response?.data?.non_field_errors ? error.response.data.non_field_errors[0] : "Erro ao cadastrar");
            
            console.error('Erro ao cadastrar:', error.response?.data);
            setMsgErro(msg);
            
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/depositos">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_deposito_form}
                >
                    <p id={styles.cadastro}>Cadastro de Depósito</p>
                    
                    {/* Campo Nome */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome do depósito <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' 
                            id={styles.nomeDeposito}
                            name='nome'
                            required
                            placeholder='Ex: Depósito Central'
                            value={formData.nome}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Campo Filial com React-Select */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Filial <span className={styles.asterisk}>*</span>
                        </label>
                        <Select
                            placeholder="Selecione a filial"
                            noOptionsMessage={() => "Nenhuma filial encontrada"}
                            styles={customSelectStyles}
                            options={filiaisOptions}
                            value={formData.filial}
                            onChange={handleFilialChange}
                            isClearable
                            required
                        />
                    </div>
                    
                    <button id={styles.enviar} type='submit'>
                        ENVIAR
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent message={msgErro} />}
            </div>
        </div>
    );
};

export default DepositoCadastro;