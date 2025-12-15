import React from 'react';
import { Outlet } from 'react-router-dom';
import MenuComponent from '../components/Menu/Menu';

const Layout = () => {
    return (
        // Container Pai: Flexbox para colocar um ao lado do outro
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            
            {/* 
                ÁREA DO MENU 
                z-index: 1000 garante que ele fique EM CIMA de tudo (clicável).
                Se o seu componente MenuComponent já tiver position: fixed no CSS dele,
                você precisará adicionar uma largura fixa aqui ou no CSS dele para empurrar o conteúdo.
            */}
            <div style={{ zIndex: 1000, flexShrink: 0 }}>
                <MenuComponent />
            </div>

            {/* 
                ÁREA DO CONTEÚDO 
                flex: 1 faz ele pegar APENAS o espaço que sobrar (os 85%).
                position: relative e zIndex: 1 garantem que ele fique comportado.
            */}
            <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                backgroundColor: '#2c2c2c',
                position: 'relative',
                zIndex: 1
            }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;