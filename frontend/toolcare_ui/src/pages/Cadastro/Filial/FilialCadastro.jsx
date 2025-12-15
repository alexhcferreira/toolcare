import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './filial_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const FilialCadastro = () => {
    // Campos baseados no model Filial (nome, cidade)
    const [formData, setFormData] = useState({
        nome: '',
        cidade: ''
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
            // Endpoint para Filiais
            const response = await api.post('/api/filiais/', formData);
            
            console.log("Filial cadastrada com sucesso:", response.data);

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome: '', cidade: '' });
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
            {/* Link voltando para a lista de filiais */}
            <Link to="/filiais">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_filial_form}
                >
                    <p id={styles.cadastro}>Cadastro de Filial</p>
                    
                    <input
                        type='text'
                        id={styles.nomeFilial}
                        name='nome'
                        required
                        placeholder='Nome da Filial'
                        value={formData.nome}
                        onChange={handleChange}
                    />
                    
                    <input
                        type='text'
                        id={styles.cidadeFilial}
                        name='cidade'
                        required
                        placeholder='Cidade'
                        value={formData.cidade}
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

export default FilialCadastro;