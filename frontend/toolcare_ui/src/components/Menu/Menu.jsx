import React, { useState, useEffect, useContext } from "react";
import styles from '../../components/Menu/menu.module.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

// ... (seus imports de ícones continuam iguais) ...
import visaoGeralIcon from '../../assets/icones/visao_geral.png';
import emprestimosIcon from '../../assets/icones/emprestimos.png';
import ferramentasIcon from '../../assets/icones/ferramentas.png';
import funcionariosIcon from '../../assets/icones/funcionarios.png';
import manutencoesIcon from '../../assets/icones/manutencoes.png';
import cargosIcon from '../../assets/icones/cargos.png';
import setoresIcon from '../../assets/icones/setores.png';
import logoutIcon from '../../assets/icones/logout.png';
import visaoGeralIconLaranja from '../../assets/icones/visao_geral_laranja.png';
import emprestimosIconLaranja from '../../assets/icones/emprestimos_laranja.png';
import ferramentasIconLaranja from '../../assets/icones/ferramentas_laranja.png';
import funcionariosIconLaranja from '../../assets/icones/funcionarios_laranja.png';
import manutencoesIconLaranja from '../../assets/icones/manutencoes_laranja.png';
import cargosIconLaranja from '../../assets/icones/cargos_laranja.png';
import setoresIconLaranja from '../../assets/icones/setores_laranja.png';
import inativosIcon from '../../assets/icones/inativos.png';
// ... etc ...

export const MenuComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Pegamos o objeto 'user' do contexto
    const { logout, user } = useContext(AuthContext); 
    
    const [selectedItem, setSelectedItem] = useState('');

    // Verifica se o usuário tem permissão avançada (Admin ou Máximo)
    // Se o user.tipo não estiver carregado ainda, assume falso por segurança
    const isAdminOrMaximo = user && (user.tipo === 'ADMINISTRADOR' || user.tipo === 'MAXIMO');

    useEffect(() => {
        // ... (seu código do useEffect / routeMapping continua igual) ...
        const currentPath = location.pathname.split('/')[1];
        const routeMapping = {
            'cargo_cadastro': 'cargos',
            'ferramenta_cadastro': 'ferramentas',
            'funcionario_cadastro': 'funcionarios',
            'emprestimo_cadastro': 'emprestimos',
            'manutencao_cadastro': 'manutencoes',
            'setor_cadastro': 'setores',
            'deposito_cadastro': 'depositos',
            'usuario_cadastro': 'usuarios',
            'filial_cadastro': 'filiais'
        };
        const activeItem = routeMapping[currentPath] || currentPath;

        if (activeItem) {
            setSelectedItem(activeItem);
            localStorage.setItem('selectedItem', activeItem);
        } else {
            setSelectedItem('visao_geral');
        }
    }, [location]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const getIconSrc = (item, defaultIcon, activeIcon) => {
        return selectedItem === item ? activeIcon : defaultIcon;
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div id={styles.menu_div}>
            <nav id={styles.menu_nav}>
                <ul id={styles.menu_ul}>
                    
                    {/* ITENS VISÍVEIS PARA TODOS */}
                    
                    <Link to="/visao_geral">
                        <li id="visao_geral" className={`${styles.div_navbar} ${selectedItem === 'visao_geral' ? styles.selected : ''}`} onClick={() => handleItemClick('visao_geral')}>
                            <img src={getIconSrc('visao_geral', visaoGeralIcon, visaoGeralIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'visao_geral' ? styles.selected : ''}`}>VISÃO GERAL</h4>
                        </li>
                    </Link>

                    <Link to="/emprestimos">
                        <li id="emprestimos" className={`${styles.div_navbar} ${selectedItem === 'emprestimos' ? styles.selected : ''}`} onClick={() => handleItemClick('emprestimos')}>
                            <img src={getIconSrc('emprestimos', emprestimosIcon, emprestimosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'emprestimos' ? styles.selected : ''}`}>EMPRÉSTIMOS</h4>
                        </li>
                    </Link>

                    <Link to="/ferramentas">
                        <li id="ferramentas" className={`${styles.div_navbar} ${selectedItem === 'ferramentas' ? styles.selected : ''}`} onClick={() => handleItemClick('ferramentas')}>
                            <img src={getIconSrc('ferramentas', ferramentasIcon, ferramentasIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'ferramentas' ? styles.selected : ''}`}>FERRAMENTAS</h4>
                        </li>
                    </Link>

                    <Link to="/funcionarios">
                        <li id="funcionarios" className={`${styles.div_navbar} ${selectedItem === 'funcionarios' ? styles.selected : ''}`} onClick={() => handleItemClick('funcionarios')}>
                            <img src={getIconSrc('funcionarios', funcionariosIcon, funcionariosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'funcionarios' ? styles.selected : ''}`}>FUNCIONÁRIOS</h4>
                        </li>
                    </Link>

                    <Link to="/manutencoes">
                        <li id="manutencoes" className={`${styles.div_navbar} ${selectedItem === 'manutencoes' ? styles.selected : ''}`} onClick={() => handleItemClick('manutencoes')}>
                            <img src={getIconSrc('manutencoes', manutencoesIcon, manutencoesIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'manutencoes' ? styles.selected : ''}`}>MANUTENÇÕES</h4>
                        </li>
                    </Link>

                    {/* --- ITENS RESTRITOS (SÓ ADMIN/MÁXIMO VÊM) --- */}
                    
                    {isAdminOrMaximo && (
                        <Link to="/filiais">
                            <li id="filiais" className={`${styles.div_navbar} ${selectedItem === 'filiais' ? styles.selected : ''}`} onClick={() => handleItemClick('filiais')}>
                                <img src={getIconSrc('filiais', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                                <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'filiais' ? styles.selected : ''}`}>FILIAIS</h4>
                            </li>
                        </Link>
                    )}

                    {/* Coordenadores podem ver Depósitos? Se sim, deixe fora do IF. Se não, coloque dentro. 
                        Vou assumir que eles veem depósitos, mas não filiais, conforme seu pedido. */}
                    <Link to="/depositos">
                        <li id="depositos" className={`${styles.div_navbar} ${selectedItem === 'depositos' ? styles.selected : ''}`} onClick={() => handleItemClick('depositos')}>
                            <img src={getIconSrc('depositos', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'depositos' ? styles.selected : ''}`}>DEPÓSITOS</h4>
                        </li>
                    </Link>

                    <Link to="/cargos">
                        <li id="cargos" className={`${styles.div_navbar} ${selectedItem === 'cargos' ? styles.selected : ''}`} onClick={() => handleItemClick('cargos')}>
                            <img src={getIconSrc('cargos', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'cargos' ? styles.selected : ''}`}>CARGOS</h4>
                        </li>
                    </Link>

                    <Link to="/setores">
                        <li id="setores" className={`${styles.div_navbar} ${selectedItem === 'setores' ? styles.selected : ''}`} onClick={() => handleItemClick('setores')}>
                            <img src={getIconSrc('setores', setoresIcon, setoresIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'setores' ? styles.selected : ''}`}>SETORES</h4>
                        </li>
                    </Link>
                    
                    {/* USUÁRIOS TAMBÉM É RESTRITO */}
                    {isAdminOrMaximo && (
                        <Link to="/usuarios">
                            <li id="usuarios" className={`${styles.div_navbar} ${selectedItem === 'usuarios' ? styles.selected : ''}`} onClick={() => handleItemClick('usuarios')}>
                                <img src={getIconSrc('usuarios', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                                <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'usuarios' ? styles.selected : ''}`}>USUÁRIOS</h4>
                            </li>
                        </Link>
                    )}

                </ul>
                
                {/* ... (inativos e logout) ... */}
                <Link to="/emprestimo_inativo">
                    <li id="inativos" className={`${styles.div_navbar} ${styles.div_inativos}`} onClick={() => handleItemClick('inativos')}>
                        <img src={inativosIcon} className={`${styles.item} ${styles.quadradinho_inativos}`} alt="Ícone" />
                        <h4 className={`${styles.item} ${styles.texto_menu}`}>INATIVOS</h4>
                    </li>
                </Link>

                <li id="logout" className={`${styles.div_navbar} ${styles.div_logout}`} onClick={handleLogout}>
                    <img src={logoutIcon} className={`${styles.item} ${styles.quadradinho_logout}`} alt="Ícone" />
                    <h4 className={`${styles.item} ${styles.texto_menu}`}>SAIR</h4>
                </li>
            </nav>
        </div>
    );
};

export default MenuComponent;