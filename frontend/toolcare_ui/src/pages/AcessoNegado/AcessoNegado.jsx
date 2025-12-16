import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AcessoNegado.module.css';
import { FaLock } from 'react-icons/fa'; // Ícone de cadeado

const AcessoNegado = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconContainer}>
                    <FaLock className={styles.icon} />
                </div>
                
                <h1 className={styles.title}>Acesso Negado</h1>
                
                <p className={styles.message}>
                    Desculpe, o seu usuário não tem permissão <br /> 
                    de acesso a esse destino.
                </p>

                <div className={styles.divider}></div>

                <button 
                    className={styles.button} 
                    onClick={() => navigate('/visao_geral')}
                >
                    VOLTAR
                </button>
            </div>
        </div>
    );
};

export default AcessoNegado;