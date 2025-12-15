import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './deposito_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const DepositoCadastro = () => {
    const [formData, setFormData] = useState({
        nome: '',
        filial: '' // Aqui vai o ID da filial selecionada
    });

    // Estado para armazenar a lista de filiais para o Dropdown
    const [filiais, setFiliais] = useState([]);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    // Carrega as filiais assim que a tela abre
    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                setFiliais(response.data);
            } catch (error) {
                console.error("Erro ao carregar filiais:", error);
            }
        };
        loadFiliais();
    }, []);

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
            const response = await api.post('/api/depositos/', formData);
            
            console.log("Depósito cadastrado com sucesso:", response.data);

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome: '', filial: '' }); // Reseta o form
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
                    
                    <input
                        type='text'
                        id={styles.nomeDeposito}
                        name='nome'
                        required
                        placeholder='Nome do Depósito'
                        value={formData.nome}
                        onChange={handleChange}
                    />
                    
                    {/* Select para escolher a Filial */}
                    <select
                        name="filial"
                        value={formData.filial}
                        onChange={handleChange}
                        required
                        className={styles.selectInput}
                    >
                        <option value="" disabled>Selecione a Filial</option>
                        {filiais.map(filial => (
                            <option key={filial.id} value={filial.id}>
                                {filial.nome}
                            </option>
                        ))}
                    </select>
                    
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

export default DepositoCadastro;