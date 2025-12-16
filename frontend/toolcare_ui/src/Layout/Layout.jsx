import React from 'react';
import { Outlet } from 'react-router-dom';
import MenuComponent from '../components/Menu/Menu';
// Importe o CSS que acabamos de criar
import styles from './Layout.module.css'; 

const Layout = () => {
    return (
        <div className={styles.layoutContainer}>
            
            {/* Área do Menu (vai sumir em telas menores) */}
            <div className={styles.menuArea}>
                <MenuComponent />
            </div>

            {/* Área do Conteúdo (vai expandir e centralizar) */}
            <div className={styles.contentArea}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;