import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ferramenta_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

// 1. IMPORTAR O HOOK
import { useQueryClient } from '@tanstack/react-query';

const FerramentaCadastro = () => {
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        nome: '',
        numero_serie: '',
        descricao: '',
        data_aquisicao: '',
        deposito: null, 
        foto: null
    });

    const [fileName, setFileName] = useState('');
    const [depositosOptions, setDepositosOptions] = useState([]);
    
    const [inputType, setInputType] = useState('text');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const loadDepositos = async () => {
            try {
                const response = await api.get('/api/depositos/');
                const lista = response.data.results || response.data;

                const formatados = lista.map(d => ({
                    value: d.id,
                    label: `${d.nome} ${d.filial_nome ? `(${d.filial_nome})` : ''}`
                }));
                
                setDepositosOptions(formatados);
            } catch (error) {
                console.error("Erro ao carregar depósitos:", error);
            }
        };
        loadDepositos();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDepositoChange = (selectedOption) => {
        setFormData({ ...formData, deposito: selectedOption });
    };

    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            setFormData({ ...formData, foto: file });
            setFileName(file.name);
        }
    };

    const formatFileName = (name) => {
        if (!name) return '';
        if (name.length > 40) return name.substring(0, 37) + '...'; 
        return name;
    };

    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.deposito) {
            alert("Selecione um depósito!"); 
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('nome', formData.nome);
        dataToSend.append('numero_serie', formData.numero_serie);
        dataToSend.append('descricao', formData.descricao);
        dataToSend.append('deposito', formData.deposito.value);
        
        if (formData.data_aquisicao) {
            dataToSend.append('data_aquisicao', formData.data_aquisicao);
        }

        if (formData.foto) {
            dataToSend.append('foto', formData.foto);
        }

        try {
            const response = await api.post('/api/ferramentas/', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            console.log("Ferramenta cadastrada:", response.data);

            // 3. INVALIDAR O CACHE
            queryClient.invalidateQueries(['ferramentas']);

            setShowSuccess(true);
            setShowError(false);
            
            setFormData({
                nome: '', numero_serie: '', descricao: '', 
                data_aquisicao: '', deposito: null, foto: null
            });
            setFileName('');
            setInputType('text');

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Erro ao cadastrar:', error.response ? error.response.data : error.message);
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/ferramentas">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_ferramenta_form}
                >
                    <p id={styles.cadastro}>Cadastro de Ferramenta</p>
                    
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Nome <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='text' name='nome' required
                                placeholder='Ex: Chave de fenda'
                                value={formData.nome} onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Nº de Série <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='text' name='numero_serie' required
                                placeholder='Ex: 12345-ABC'
                                value={formData.numero_serie} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Depósito <span className={styles.asterisk}>*</span>
                            </label>
                            <Select
                                placeholder="Selecione o depósito"
                                noOptionsMessage={() => "Nenhum depósito encontrado"}
                                styles={customSelectStyles}
                                options={depositosOptions}
                                value={formData.deposito}
                                onChange={handleDepositoChange}
                                isClearable
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Data Aquisição
                            </label>
                            <input
                                type={inputType}
                                name='data_aquisicao' 
                                placeholder='Selecione a data'
                                onFocus={() => setInputType('date')}
                                onBlur={() => setInputType('text')}
                                value={inputType === 'date' ? formData.data_aquisicao : formatDateToDisplay(formData.data_aquisicao)}
                                onChange={handleChange}
                                className={styles.dateInput}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Descrição</label>
                        <input
                            type='text' name='descricao'
                            placeholder='Digite a descrição'
                            value={formData.descricao} onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Foto</label>
                        <label htmlFor="fotoInput" className={styles.customFileLabel}>
                            {fileName ? `Arquivo: ${formatFileName(fileName)}` : "Clique para selecionar..."}
                        </label>
                        <input 
                            type="file" 
                            id="fotoInput"
                            name="foto"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.hiddenFileInput}
                        />
                    </div>
                    
                    <button id={styles.enviar} type='submit'>
                        ENVIAR
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent />}
            </div>
        </div>
    );
};

export default FerramentaCadastro;