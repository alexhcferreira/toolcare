import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './cargo_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

// 1. IMPORTAR O HOOK DO REACT QUERY
import { useQueryClient } from '@tanstack/react-query';

const CargoCadastro = () => {
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        nome_cargo: '',
        descricao_cargo: ''
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
            const response = await api.post('/api/cargos/', formData);
            
            console.log("Cargo cadastrado com sucesso:", response.data);

            // 3. INVALIDAR O CACHE DA LISTA DE CARGOS
            queryClient.invalidateQueries(['cargos']);

            setShowSuccess(true);
            setShowError(false);
            setFormData({ nome_cargo: '', descricao_cargo: '' });
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            // Tratamento de erro aprimorado
            const msg = error.response?.data?.nome_cargo 
                ? error.response.data.nome_cargo[0] 
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
            <Link to="/cargos">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_cargo_form}
                >
                    <p id={styles.cadastro}>Cadastro de Cargo</p>
                    
                    {/* Campo Nome */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome do cargo <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text'
                            id={styles.nomeCargo}
                            name='nome_cargo'
                            required
                            placeholder='Ex: Técnico de Manutenção'
                            value={formData.nome_cargo}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Campo Descrição */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Descrição</label>
                        <input
                            type='text'
                            id={styles.descricaoCargo}
                            name='descricao_cargo'
                            placeholder='Digite a descrição (Opcional)'
                            value={formData.descricao_cargo}
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

export default CargoCadastro;