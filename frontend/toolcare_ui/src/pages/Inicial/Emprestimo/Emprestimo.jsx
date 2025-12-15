import React from 'react';
import { Link } from 'react-router-dom';
import styles from './emprestimo.module.css';

const Emprestimo = () => {
    return (
        <div className={styles.container}>
            <Link to="/emprestimo_cadastro" className={styles.addButton}>
                +
            </Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar..."
                />
            </div>

            <div className={styles.contentArea}>
                <h2 style={{color: '#888', marginTop: '5rem', fontSize: '2rem'}}>
                    Lista de Empréstimos Ativos
                </h2>
            </div>
        </div>
    );
}

export default Emprestimo;