import React from 'react';
import { Outlet } from 'react-router-dom';
import MenuComponent from '../components/Menu/Menu'; // Ajuste o caminho se necessário

const Layout = () => {
    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* O Menu fica fixo aqui */}
            <MenuComponent />

            {/* O conteúdo da página muda aqui dentro */}
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#2c2c2c' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;