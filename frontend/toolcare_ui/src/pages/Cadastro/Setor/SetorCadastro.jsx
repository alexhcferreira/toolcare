import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './setor_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

// 1. IMPORTAR O HOOK DO REACT QUERY
import { useQueryClient } from '@tanstack/react-query';

const SetorCadastro = () => {
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        nome_setor: '',
        descricao_setor: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await api.post('/api/setores/', formData);
            
            console.log("Setor cadastrado com sucesso:", response.data);

            // 3. INVALIDAR O CACHE DA LISTA DE SETORES
            // Isso força a atualização imediata na tela de listagem
            queryClient.invalidateQueries(['setores']);

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome_setor: '', descricao_setor: '' });
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            // Tratamento de erro aprimorado (caso o backend mande mensagem específica)
            const msg = error.response?.data?.nome_setor 
                ? error.response.data.nome_setor[0] 
                : (error.response?.data?.detail || "Erro ao cadastrar");
            
            console.error('Erro ao cadastrar:', error.response?.data);
            setMsgErro(msg);

            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/setores">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_setor_form}
                >
                    <p id={styles.cadastro}>Cadastro de Setor</p>
                    
                    {/* Campo Nome */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome do Setor <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text'
                            id={styles.nomeSetor}
                            name='nome_setor'
                            required
                            placeholder='Ex: Soldagem'
                            value={formData.nome_setor}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Campo Descrição */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Descrição</label>
                        <input
                            type='text'
                            id={styles.descricaoSetor}
                            name='descricao_setor'
                            placeholder='Digite a descrição (Opcional)'
                            value={formData.descricao_setor}
                            onChange={handleChange}
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

export default SetorCadastro;