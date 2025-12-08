import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Layout from '../src/Layout/Layout';
import Login from './pages/Login/Login';

// Importando a Visão Geral (que agora é o Dashboard oficial)
import VisaoGeral from '../src/pages/Inicial/VisaoGeral/VisaoGeral';

const AppRoutes = () => {
    
    // Componente de proteção
    const Private = ({ children }) => {
        const { authenticated, loading } = useContext(AuthContext);

        if (loading) {
            return <div style={{color:'#fff', padding: 20}}>Carregando sistema...</div>;
        }

        if (!authenticated) {
            return <Navigate to="/" />;
        }

        return children;
    };

    return (
        <Routes>
            {/* 1. Rota de Login (Pública) */}
            <Route path="/" element={<Login />} />

            {/* 2. Rotas Protegidas (Dentro do Layout com Menu) */}
            <Route element={<Private><Layout /></Private>}>
                
                {/* Rota Principal */}
                <Route path="/visao_geral" element={<VisaoGeral />} />

                {/* --- Placeholders para as rotas do Menu --- */}
                {/* Conforme formos criando as telas, vamos substituindo as <div> pelos componentes reais */}
                
                <Route path="/emprestimos" element={<div style={{color:'white', padding: 20}}>Tela de Empréstimos</div>} />
                <Route path="/ferramentas" element={<div style={{color:'white', padding: 20}}>Tela de Ferramentas</div>} />
                <Route path="/funcionarios" element={<div style={{color:'white', padding: 20}}>Tela de Funcionários</div>} />
                <Route path="/manutencoes" element={<div style={{color:'white', padding: 20}}>Tela de Manutenções</div>} />
                
                <Route path="/filiais" element={<div style={{color:'white', padding: 20}}>Tela de Filiais</div>} />
                <Route path="/depositos" element={<div style={{color:'white', padding: 20}}>Tela de Depósitos</div>} />
                <Route path="/cargos" element={<div style={{color:'white', padding: 20}}>Tela de Cargos</div>} />
                <Route path="/setores" element={<div style={{color:'white', padding: 20}}>Tela de Setores</div>} />
                <Route path="/usuarios" element={<div style={{color:'white', padding: 20}}>Tela de Usuários</div>} />
                
                <Route path="/emprestimo_inativo" element={<div style={{color:'white', padding: 20}}>Tela de Inativos</div>} />

            </Route>

            {/* 3. Rota Coringa (Se digitar algo errado, vai para Visão Geral) */}
            <Route path="*" element={<Navigate to="/visao_geral" />} />
        </Routes>
    );
};

export default AppRoutes;