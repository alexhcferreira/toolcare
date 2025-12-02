import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

const AppRoutes = () => {
    
    // Componente "Segurança": Só renderiza o conteúdo se estiver logado
    const Private = ({ children }) => {
        const { authenticated, loading } = useContext(AuthContext);

        if (loading) {
            return <div style={{color: '#fff'}}>Carregando sistema...</div>;
        }

        if (!authenticated) {
            return <Navigate to="/" />;
        }

        return children;
    };

    return (
        <Routes>
            {/* Rota Pública: Login */}
            <Route path="/" element={<Login />} />

            {/* Rota Privada: Dashboard */}
            <Route 
                path="/dashboard" 
                element={
                    <Private>
                        <Dashboard />
                    </Private>
                } 
            />
            
            {/* Qualquer rota desconhecida joga para o Login */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;