import React, { useState, useEffect, useContext } from "react";
import styles from './menu_inativos.module.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

// Imports de ícones (PODE USAR OS MESMOS, DEPOIS VOCÊ TROCA)
import emprestimosIcon from '../../assets/icones/emprestimos_preto.png';
import ferramentasIcon from '../../assets/icones/ferramentas_preto.png';
import funcionariosIcon from '../../assets/icones/funcionarios_preto.png';
import manutencoesIcon from '../../assets/icones/manutencoes_preto.png';
import cargosIcon from '../../assets/icones/cargos_preto.png';
import setoresIcon from '../../assets/icones/setores_preto.png';
import logoutIcon from '../../assets/icones/logout_preto.png';
import emprestimosIconLaranja from '../../assets/icones/emprestimos_laranja.png';
import ferramentasIconLaranja from '../../assets/icones/ferramentas_laranja.png';
import funcionariosIconLaranja from '../../assets/icones/funcionarios_laranja.png';
import manutencoesIconLaranja from '../../assets/icones/manutencoes_laranja.png';
import cargosIconLaranja from '../../assets/icones/cargos_laranja.png';
import setoresIconLaranja from '../../assets/icones/setores_laranja.png';
import filiaisIcon from '../../assets/icones/filiais_preto.png';
import filiaisIconLaranja from '../../assets/icones/filiais_laranja.png';
import depositosIcon from '../../assets/icones/depositos_preto.png';
import depositosIconLaranja from '../../assets/icones/depositos_laranja.png';
import usuariosIcon from '../../assets/icones/usuarios_preto.png';
import usuariosIconLaranja from '../../assets/icones/usuarios_laranja.png';
import inativosIcon from '../../assets/icones/inativos.png';

import ativosIcon from '../../assets/icones/ativos_preto.png'; // Usando o mesmo por enquanto

const MenuInativos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext); 
    const [selectedItem, setSelectedItem] = useState('');

    const isAdminOrMaximo = user && (user.tipo === 'ADMINISTRADOR' || user.tipo === 'MAXIMO');

    useEffect(() => {
        const currentPath = location.pathname.split('/')[1];
        // Mapeia rotas para IDs do menu
        const routeMapping = {
            'emprestimos_inativos': 'emprestimos',
            'ferramentas_inativas': 'ferramentas',
            'funcionarios_inativos': 'funcionarios',
            'manutencoes_inativas': 'manutencoes',
            'cargos_inativos': 'cargos',
            'setores_inativos': 'setores',
            'depositos_inativos': 'depositos',
            'filiais_inativas': 'filiais',
            'usuarios_inativos': 'usuarios'
        };
        const activeItem = routeMapping[currentPath] || currentPath;

        if (activeItem) {
            setSelectedItem(activeItem);
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
                    
                    <Link to="/emprestimos_inativos">
                        <li id="emprestimos" className={`${styles.div_navbar} ${selectedItem === 'emprestimos' ? styles.selected : ''}`} onClick={() => handleItemClick('emprestimos')}>
                            <img src={getIconSrc('emprestimos', emprestimosIcon, emprestimosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'emprestimos' ? styles.selected : ''}`}>EMPRÉSTIMOS</h4>
                        </li>
                    </Link>

                    <Link to="/ferramentas_inativas">
                        <li id="ferramentas" className={`${styles.div_navbar} ${selectedItem === 'ferramentas' ? styles.selected : ''}`} onClick={() => handleItemClick('ferramentas')}>
                            <img src={getIconSrc('ferramentas', ferramentasIcon, ferramentasIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'ferramentas' ? styles.selected : ''}`}>FERRAMENTAS</h4>
                        </li>
                    </Link>

                    <Link to="/funcionarios_inativos">
                        <li id="funcionarios" className={`${styles.div_navbar} ${selectedItem === 'funcionarios' ? styles.selected : ''}`} onClick={() => handleItemClick('funcionarios')}>
                            <img src={getIconSrc('funcionarios', funcionariosIcon, funcionariosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'funcionarios' ? styles.selected : ''}`}>FUNCIONÁRIOS</h4>
                        </li>
                    </Link>

                    <Link to="/manutencoes_inativas">
                        <li id="manutencoes" className={`${styles.div_navbar} ${selectedItem === 'manutencoes' ? styles.selected : ''}`} onClick={() => handleItemClick('manutencoes')}>
                            <img src={getIconSrc('manutencoes', manutencoesIcon, manutencoesIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'manutencoes' ? styles.selected : ''}`}>MANUTENÇÕES</h4>
                        </li>
                    </Link>

                    {/* ITENS SECUNDÁRIOS */}
                    
                    <Link to="/depositos_inativos">
                        <li id="depositos" className={`${styles.div_navbar} ${selectedItem === 'depositos' ? styles.selected : ''}`} onClick={() => handleItemClick('depositos')}>
                            <img src={getIconSrc('depositos', depositosIcon, depositosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'depositos' ? styles.selected : ''}`}>DEPÓSITOS</h4>
                        </li>
                    </Link>

                    <Link to="/cargos_inativos">
                        <li id="cargos" className={`${styles.div_navbar} ${selectedItem === 'cargos' ? styles.selected : ''}`} onClick={() => handleItemClick('cargos')}>
                            <img src={getIconSrc('cargos', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'cargos' ? styles.selected : ''}`}>CARGOS</h4>
                        </li>
                    </Link>

                    <Link to="/setores_inativos">
                        <li id="setores" className={`${styles.div_navbar} ${selectedItem === 'setores' ? styles.selected : ''}`} onClick={() => handleItemClick('setores')}>
                            <img src={getIconSrc('setores', setoresIcon, setoresIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'setores' ? styles.selected : ''}`}>SETORES</h4>
                        </li>
                    </Link>

                    {/* RESTRITOS */}
                    {isAdminOrMaximo && (
                        <>
                            <Link to="/filiais_inativas">
                                <li id="filiais" className={`${styles.div_navbar} ${selectedItem === 'filiais' ? styles.selected : ''}`} onClick={() => handleItemClick('filiais')}>
                                    <img src={getIconSrc('filiais', filiaisIcon, filiaisIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                                    <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'filiais' ? styles.selected : ''}`}>FILIAIS</h4>
                                </li>
                            </Link>

                            <Link to="/usuarios_inativos">
                                <li id="usuarios" className={`${styles.div_navbar} ${selectedItem === 'usuarios' ? styles.selected : ''}`} onClick={() => handleItemClick('usuarios')}>
                                    <img src={getIconSrc('usuarios', usuariosIcon, usuariosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone" />
                                    <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'usuarios' ? styles.selected : ''}`}>USUÁRIOS</h4>
                                </li>
                            </Link>
                        </>
                    )}

                </ul>

                {/* BOTÃO VOLTAR PARA ATIVOS */}
                <Link to="/visao_geral">
                    <li id="ativos" className={`${styles.div_navbar} ${styles.div_inativos}`}>
                        <img src={ativosIcon} className={`${styles.item} ${styles.quadradinho_inativos}`} alt="Ícone" />
                        <h4 id="texto_ativos" className={`${styles.item} ${styles.texto_menu}`}>ATIVOS</h4>
                    </li>
                </Link>

                {/* LOGOUT */}
                <li id="logout" className={`${styles.div_navbar} ${styles.div_logout}`} onClick={handleLogout}>
                    <img src={logoutIcon} className={`${styles.item} ${styles.quadradinho_logout}`} alt="Ícone" />
                    <h4 className={`${styles.item} ${styles.texto_menu}`}>SAIR</h4>
                </li>
            </nav>
        </div>
    );
};

export default MenuInativos;