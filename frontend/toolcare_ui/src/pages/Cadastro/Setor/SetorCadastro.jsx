import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './setor_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const SetorCadastro = () => {
    const [formData, setFormData] = useState({
        nome_setor: '',
        descricao_setor: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

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

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome_setor: '', descricao_setor: '' });
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
                            placeholder='Digite a descrição'
                            value={formData.descricao_setor}
                            onChange={handleChange}
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

export default SetorCadastro;