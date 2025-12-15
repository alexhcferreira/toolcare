import React from 'react';
import { Link } from 'react-router-dom';
import styles from './deposito.module.css';

const Deposito = () => {
    return (
        <div className={styles.container}>
            {/* Botão de Adicionar (+) redirecionando para cadastro de depósito */}
            <Link to="/deposito_cadastro" className={styles.addButton}>
                +
            </Link>

            {/* Barra de Pesquisa Centralizada */}
            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar..."
                />
            </div>

            {/* Placeholder da Lista */}
            <div className={styles.contentArea}>
                <h2 style={{color: '#888', marginTop: '5rem', fontSize: '2rem'}}>
                    Lista de Depósitos
                </h2>
            </div>
        </div>
    );
}

export default Deposito;