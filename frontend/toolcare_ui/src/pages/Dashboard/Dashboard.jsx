import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <h1>Bem-vindo ao ToolCare</h1>
            <p>Usuário logado: {user ? user.nome : 'Carregando...'}</p>
            
            <button 
                onClick={logout} 
                style={{ padding: '10px', marginTop: '20px', cursor: 'pointer' }}
            >
                Sair do Sistema
            </button>
        </div>
    );
};

export default Dashboard;