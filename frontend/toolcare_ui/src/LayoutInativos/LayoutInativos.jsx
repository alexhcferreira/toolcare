import React from 'react';
import { Outlet } from 'react-router-dom';
import MenuInativos from '../components/MenuInativos/MenuInativos'; // Ajuste o caminho se necessário
import styles from '../Layout/Layout.module.css'; // Reutiliza o mesmo CSS de layout

const LayoutInativos = () => {
    return (
        <div className={styles.layoutContainer}>
            
            <div className={styles.menuArea}>
                <MenuInativos />
            </div>

            <div className={styles.contentArea}>
                <Outlet />
            </div>
        </div>
    );
};

export default LayoutInativos;