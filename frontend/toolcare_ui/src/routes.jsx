import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Layout from '../src/Layout/Layout';
import Login from './pages/Login/Login';

// --- IMPORTAÇÃO DAS PÁGINAS ---
import VisaoGeral from './pages/Inicial/VisaoGeral/VisaoGeral';
import Cargo from './pages/Inicial/Cargo/Cargo'; 
import CargoCadastro from './pages/Cadastro/Cargo/CargoCadastro';
import Setor from './pages/Inicial/Setor/Setor';
import SetorCadastro from './pages/Cadastro/Setor/SetorCadastro';
import Funcionario from './pages/Inicial/Funcionario/Funcionario';
import FuncionarioCadastro from './pages/Cadastro/Funcionario/FuncionarioCadastro';
import Ferramenta from './pages/Inicial/Ferramenta/Ferramenta';
import FerramentaCadastro from './pages/Cadastro/Ferramenta/FerramentaCadastro';
import Emprestimo from './pages/Inicial/Emprestimo/Emprestimo';
import EmprestimoCadastro from './pages/Cadastro/Emprestimo/EmprestimoCadastro';
import Manutencao from './pages/Inicial/Manutencao/Manutencao';
import ManutencaoCadastro from './pages/Cadastro/Manutencao/ManutencaoCadastro';
import Filial from './pages/Inicial/Filial/Filial';
import FilialCadastro from './pages/Cadastro/Filial/FilialCadastro';
import Deposito from './pages/Inicial/Deposito/Deposito';
import DepositoCadastro from './pages/Cadastro/Deposito/DepositoCadastro';
import Usuario from './pages/Inicial/Usuario/Usuario';
import UsuarioCadastro from './pages/Cadastro/Usuario/UsuarioCadastro';

// Importe a página de Acesso Negado
import AcessoNegado from './pages/AcessoNegado/AcessoNegado';

const AppRoutes = () => {
    
    // 1. Proteção Básica: Só logado entra
    const Private = ({ children }) => {
        const { authenticated, loading } = useContext(AuthContext);
        if (loading) return <div style={{color:'#fff', padding: 20}}>Carregando...</div>;
        if (!authenticated) return <Navigate to="/" />;
        return children;
    };

    // 2. Proteção Avançada: Só Admin ou Máximo entra
    // Se for Coordenador, joga para Acesso Negado
    const AdminOnly = ({ children }) => {
        const { user } = useContext(AuthContext);
        
        // Se o usuário já carregou e é COORDENADOR, bloqueia
        if (user && user.tipo === 'COORDENADOR') {
            return <Navigate to="/acesso_negado" replace />;
        }
        
        return children;
    };

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Rota de Acesso Negado (Fora do Layout ou Dentro, você escolhe. Fora dá mais destaque) */}
            <Route path="/acesso_negado" element={<AcessoNegado />} />

            <Route element={<Private><Layout /></Private>}>
                
                <Route path="/visao_geral" element={<VisaoGeral />} />

                {/* --- MÓDULOS LIVRES (Todos acessam) --- */}
                <Route path="/cargos" element={<Cargo />} /> 
                <Route path="/cargo_cadastro" element={<CargoCadastro />} />
                <Route path="/setores" element={<Setor />} />
                <Route path="/setor_cadastro" element={<SetorCadastro />} />
                <Route path="/depositos" element={<Deposito />} />
                <Route path="/deposito_cadastro" element={<DepositoCadastro />} />
                <Route path="/funcionarios" element={<Funcionario />} />
                <Route path="/funcionario_cadastro" element={<FuncionarioCadastro />} />
                <Route path="/ferramentas" element={<Ferramenta />} />
                <Route path="/ferramenta_cadastro" element={<FerramentaCadastro />} />
                <Route path="/emprestimos" element={<Emprestimo />} />
                <Route path="/emprestimo_cadastro" element={<EmprestimoCadastro />} />
                <Route path="/emprestimo_inativo" element={<div style={{color:'white', padding: 20}}>Histórico de Inativos</div>} />
                <Route path="/manutencoes" element={<Manutencao />} />
                <Route path="/manutencao_cadastro" element={<ManutencaoCadastro />} />

                {/* --- MÓDULOS RESTRITOS (Filiais e Usuários) --- */}
                {/* Envolvemos as rotas no componente AdminOnly */}
                
                <Route path="/filiais" element={
                    <AdminOnly><Filial /></AdminOnly>
                } />
                <Route path="/filial_cadastro" element={
                    <AdminOnly><FilialCadastro /></AdminOnly>
                } />

                <Route path="/usuarios" element={
                     <AdminOnly><Usuario /></AdminOnly>
                } />
                <Route path="/usuario_cadastro" element={
                    <AdminOnly><UsuarioCadastro /></AdminOnly>
                } />

            </Route>

            <Route path="*" element={<Navigate to="/visao_geral" />} />
        </Routes>
    );
};

export default AppRoutes;