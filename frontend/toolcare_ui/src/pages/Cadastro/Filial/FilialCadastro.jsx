import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './filial_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

// 1. IMPORTAR O HOOK DO REACT QUERY
import { useQueryClient } from '@tanstack/react-query';

const FilialCadastro = () => {
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

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
            const response = await api.post('/api/filiais/', formData);
            
            console.log("Filial cadastrada com sucesso:", response.data);

            // 3. A MÁGICA: INVALIDAR O CACHE DA LISTA
            // Isso força a tela de listagem a buscar os dados novos assim que você entrar nela
            queryClient.invalidateQueries(['filiais']);

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
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome da Filial <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' name='nome' required
                            placeholder='Digite o nome'
                            value={formData.nome} onChange={handleChange}
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Cidade <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' name='cidade' required
                            placeholder='Digite a cidade'
                            value={formData.cidade} onChange={handleChange}
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

export default FilialCadastro;