import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Layout from '../src/Layout/Layout'; // Certifique-se que o Layout está na mesma pasta ou ajuste o caminho
import Login from './pages/Login/Login';

// --- IMPORTAÇÃO DAS PÁGINAS ---

// Visão Geral
import VisaoGeral from './pages/Inicial/VisaoGeral/VisaoGeral';

// Cargos
import Cargo from './pages/Inicial/Cargo/Cargo'; 
import CargoCadastro from './pages/Cadastro/Cargo/CargoCadastro';

// Setores
import Setor from './pages/Inicial/Setor/Setor';
import SetorCadastro from './pages/Cadastro/Setor/SetorCadastro';

import Filial from './pages/Inicial/Filial/Filial';
import FilialCadastro from './pages/Cadastro/Filial/FilialCadastro';

import Deposito from './pages/Inicial/Deposito/Deposito';
import DepositoCadastro from './pages/Cadastro/Deposito/DepositoCadastro';

import Funcionario from './pages/Inicial/Funcionario/Funcionario';
import FuncionarioCadastro from './pages/Cadastro/Funcionario/FuncionarioCadastro';

import Ferramenta from './pages/Inicial/Ferramenta/Ferramenta';
import FerramentaCadastro from './pages/Cadastro/Ferramenta/FerramentaCadastro';

import Emprestimo from './pages/Inicial/Emprestimo/Emprestimo';
import EmprestimoCadastro from './pages/Cadastro/Emprestimo/EmprestimoCadastro';

import Manutencao from './pages/Inicial/Manutencao/Manutencao';
import ManutencaoCadastro from './pages/Cadastro/Manutencao/ManutencaoCadastro';

// (Futuros imports virão aqui: Filial, Deposito, etc.)

const AppRoutes = () => {
    
    // Componente de proteção de rota (Guarda)
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
                
                {/* Rota Principal (Dashboard) */}
                <Route path="/visao_geral" element={<VisaoGeral />} />


                {/* --- MÓDULO DE CARGOS (Pronto) --- */}
                <Route path="/cargos" element={<Cargo />} /> 
                <Route path="/cargo_cadastro" element={<CargoCadastro />} />


                {/* --- MÓDULO DE SETORES (Pronto) --- */}
                <Route path="/setores" element={<Setor />} />
                <Route path="/setor_cadastro" element={<SetorCadastro />} />


                <Route path="/filiais" element={<Filial />} />
                <Route path="/filial_cadastro" element={<FilialCadastro />} />


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


                {/* --- MÓDULO DE USUÁRIOS --- */}
                <Route path="/usuarios" element={<div style={{color:'white', padding: 20}}>Lista de Usuários</div>} />
                <Route path="/usuario_cadastro" element={<div style={{color:'white', padding: 20}}>Cadastro de Usuário</div>} />

            </Route>

            {/* 3. Rota Coringa (Redireciona para Visão Geral se a URL não existir) */}
            <Route path="*" element={<Navigate to="/visao_geral" />} />
        </Routes>
    );
};

export default AppRoutes;