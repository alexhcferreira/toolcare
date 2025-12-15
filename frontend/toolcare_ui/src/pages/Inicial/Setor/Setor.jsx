import React from 'react';
import { Link } from 'react-router-dom';
import styles from './setor.module.css';

const Setor = () => {
    return (
        <div className={styles.container}>
            {/* Botão de Adicionar (+) redirecionando para cadastro de setor */}
            <Link to="/setor_cadastro" className={styles.addButton}>
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
                    Lista de Setores
                </h2>
            </div>
        </div>
    );
}

export default Setor;