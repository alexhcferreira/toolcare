import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Layout from '../src/Layout/Layout';
import LayoutInativos from '../src/LayoutInativos/LayoutInativos'; // <--- NOVO LAYOUT
import Login from './pages/Login/Login';
import AcessoNegado from './pages/AcessoNegado/AcessoNegado';

// --- PÁGINAS ATIVAS ---
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
import ListaFerramentas from './pages/Testes/ListaFerramentas';

// --- PÁGINAS INATIVAS ---
import EmprestimoInativo from './pages/Inativos/Emprestimo/EmprestimoInativo';
import FerramentaInativo from './pages/Inativos/Ferramenta/FerramentaInativo';
import FuncionarioInativo from './pages/Inativos/Funcionario/FuncionarioInativo';
import ManutencaoInativo from './pages/Inativos/Manutencao/ManutencaoInativo';
import CargoInativo from './pages/Inativos/Cargo/CargoInativo';
import SetorInativo from './pages/Inativos/Setor/SetorInativo';
import DepositoInativo from './pages/Inativos/Deposito/DepositoInativo';
import FilialInativo from './pages/Inativos/Filial/FilialInativo';
import UsuarioInativo from './pages/Inativos/Usuario/UsuarioInativo';


const AppRoutes = () => {
    
    const Private = ({ children }) => {
        const { authenticated, loading } = useContext(AuthContext);
        if (loading) return <div style={{color:'#888', padding: 20}}>Carregando...</div>;
        if (!authenticated) return <Navigate to="/" />;
        return children;
    };

    const AdminOnly = ({ children }) => {
        const { user } = useContext(AuthContext);
        if (user && user.tipo === 'COORDENADOR') {
            return <Navigate to="/acesso_negado" replace />;
        }
        return children;
    };

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/acesso_negado" element={<AcessoNegado />} />

            {/* === ÁREA ATIVA (Menu Padrão) === */}
            <Route element={<Private><Layout /></Private>}>
                <Route path="/visao_geral" element={<VisaoGeral />} />

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
                <Route path="/manutencoes" element={<Manutencao />} />
                <Route path="/manutencao_cadastro" element={<ManutencaoCadastro />} />
                <Route path="/teste_ferramentas" element={<ListaFerramentas />} />

                <Route path="/filiais" element={<AdminOnly><Filial /></AdminOnly>} />
                <Route path="/filial_cadastro" element={<AdminOnly><FilialCadastro /></AdminOnly>} />
                <Route path="/usuarios" element={<AdminOnly><Usuario /></AdminOnly>} />
                <Route path="/usuario_cadastro" element={<AdminOnly><UsuarioCadastro /></AdminOnly>} />
            </Route>

            {/* === ÁREA INATIVA (Menu Inativos - Novo Layout) === */}
            <Route element={<Private><LayoutInativos /></Private>}>
                <Route path="/emprestimos_inativos" element={<EmprestimoInativo />} />
                <Route path="/ferramentas_inativas" element={<FerramentaInativo />} />
                <Route path="/funcionarios_inativos" element={<FuncionarioInativo />} />
                <Route path="/manutencoes_inativas" element={<ManutencaoInativo />} />
                
                <Route path="/cargos_inativos" element={<CargoInativo />} />
                <Route path="/setores_inativos" element={<SetorInativo />} />
                <Route path="/depositos_inativos" element={<DepositoInativo />} />
                
                {/* Restritos também nos inativos */}
                <Route path="/filiais_inativas" element={<AdminOnly><FilialInativo /></AdminOnly>} />
                <Route path="/usuarios_inativos" element={<AdminOnly><UsuarioInativo /></AdminOnly>} />
            </Route>

            <Route path="*" element={<Navigate to="/visao_geral" />} />
        </Routes>
    );
};

export default AppRoutes;