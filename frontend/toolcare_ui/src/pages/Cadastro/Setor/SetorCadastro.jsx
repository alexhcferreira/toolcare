import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './setor_cadastro.module.css';
import api from '../../../services/api'; 
// Certifique-se que o caminho dos componentes de aviso está correto
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const SetorCadastro = () => {
    // Ajustado para os campos do modelo de Setor (nome_setor, descricao_setor)
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
            // Ajustado para o endpoint de setores
            const response = await api.post('/api/setores/', formData);
            
            console.log("Objeto cadastrado com sucesso:", response.data);

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
            {/* Link voltando para a lista de setores */}
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
                    
                    <input
                        type='text'
                        id={styles.nomeSetor}
                        name='nome_setor'
                        required
                        placeholder='Nome'
                        value={formData.nome_setor}
                        onChange={handleChange}
                    />
                    
                    <input
                        type='text'
                        id={styles.descricaoSetor}
                        name='descricao_setor'
                        placeholder='Descrição'
                        value={formData.descricao_setor}
                        onChange={handleChange}
                    />
                    
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