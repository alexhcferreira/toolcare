import React, { useState, useEffect, useContext } from "react";
import styles from './menu.module.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext'; // Importando o contexto

// Imports das imagens (Certifique-se que os caminhos estão corretos)
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

export const MenuComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); // Usando a função logout do contexto
    const [selectedItem, setSelectedItem] = useState('');

    useEffect(() => {
        // Lógica para manter o item selecionado baseado na URL atual
        const currentPath = location.pathname.split('/')[1];
        if (currentPath) {
            setSelectedItem(currentPath);
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
        logout(); // Limpa o token e o contexto
        // O redirecionamento acontece automaticamente no routes.jsx porque authenticated vira false
    };

    return (
        <div id={styles.menu_div}>
            <nav id={styles.menu_nav}>
                <ul id={styles.menu_ul}>
                    <Link to="/visao_geral">
                        <li id="visao_geral" className={`${styles.div_navbar} ${selectedItem === 'visao_geral' ? styles.selected : ''}`} onClick={() => handleItemClick('visao_geral')}>
                            <img src={getIconSrc('visao_geral', visaoGeralIcon, visaoGeralIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de visão geral" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'visao_geral' ? styles.selected : ''}`}>VISÃO GERAL</h4>
                        </li>
                    </Link>

                    <Link to="/emprestimos">
                        <li id="emprestimos" className={`${styles.div_navbar} ${selectedItem === 'emprestimos' ? styles.selected : ''}`} onClick={() => handleItemClick('emprestimos')}>
                            <img src={getIconSrc('emprestimos', emprestimosIcon, emprestimosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de empréstimos" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'emprestimos' ? styles.selected : ''}`}>EMPRÉSTIMOS</h4>
                        </li>
                    </Link>

                    <Link to="/ferramentas">
                        <li id="ferramentas" className={`${styles.div_navbar} ${selectedItem === 'ferramentas' ? styles.selected : ''}`} onClick={() => handleItemClick('ferramentas')}>
                            <img src={getIconSrc('ferramentas', ferramentasIcon, ferramentasIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de ferramentas" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'ferramentas' ? styles.selected : ''}`}>FERRAMENTAS</h4>
                        </li>
                    </Link>

                    <Link to="/funcionarios">
                        <li id="funcionarios" className={`${styles.div_navbar} ${selectedItem === 'funcionarios' ? styles.selected : ''}`} onClick={() => handleItemClick('funcionarios')}>
                            <img src={getIconSrc('funcionarios', funcionariosIcon, funcionariosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de funcionários" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'funcionarios' ? styles.selected : ''}`}>FUNCIONÁRIOS</h4>
                        </li>
                    </Link>

                    <Link to="/manutencoes">
                        <li id="manutencoes" className={`${styles.div_navbar} ${selectedItem === 'manutencoes' ? styles.selected : ''}`} onClick={() => handleItemClick('manutencoes')}>
                            <img src={getIconSrc('manutencoes', manutencoesIcon, manutencoesIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de manutenções" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'manutencoes' ? styles.selected : ''}`}>MANUTENÇÕES</h4>
                        </li>
                    </Link>

                    <Link to="/filiais">
                        <li id="filiais" className={`${styles.div_navbar} ${selectedItem === 'filiais' ? styles.selected : ''}`} onClick={() => handleItemClick('filiais')}>
                            <img src={getIconSrc('filiais', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de filiais" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'filiais' ? styles.selected : ''}`}>FILIAIS</h4>
                        </li>
                    </Link>

                    <Link to="/depositos">
                        <li id="depositos" className={`${styles.div_navbar} ${selectedItem === 'depositos' ? styles.selected : ''}`} onClick={() => handleItemClick('depositos')}>
                            <img src={getIconSrc('depositos', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de depósitos" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'depositos' ? styles.selected : ''}`}>DEPÓSITOS</h4>
                        </li>
                    </Link>

                    <Link to="/cargos">
                        <li id="cargos" className={`${styles.div_navbar} ${selectedItem === 'cargos' ? styles.selected : ''}`} onClick={() => handleItemClick('cargos')}>
                            <img src={getIconSrc('cargos', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de cargos" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'cargos' ? styles.selected : ''}`}>CARGOS</h4>
                        </li>
                    </Link>

                    <Link to="/setores">
                        <li id="setores" className={`${styles.div_navbar} ${selectedItem === 'setores' ? styles.selected : ''}`} onClick={() => handleItemClick('setores')}>
                            <img src={getIconSrc('setores', setoresIcon, setoresIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de setores" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'setores' ? styles.selected : ''}`}>SETORES</h4>
                        </li>
                    </Link>
                    
                    <Link to="/usuarios">
                        <li id="usuarios" className={`${styles.div_navbar} ${selectedItem === 'usuarios' ? styles.selected : ''}`} onClick={() => handleItemClick('usuarios')}>
                            <img src={getIconSrc('usuarios', cargosIcon, cargosIconLaranja)} className={`${styles.item} ${styles.quadradinho}`} alt="Ícone de usuários" />
                            <h4 className={`${styles.item} ${styles.texto_menu} ${selectedItem === 'usuarios' ? styles.selected : ''}`}>USUÁRIOS</h4>
                        </li>
                    </Link>
                </ul>
                
                {/*<Link to="/emprestimo_inativo">
                    <li id="inativos" className={`${styles.div_navbar} ${styles.div_inativos}`} onClick={() => handleItemClick('inativos')}>
                        <img src={inativosIcon} className={`${styles.item} ${styles.quadradinho_inativos}`} alt="Ícone de inativos" />
                        <h4 className={`${styles.item} ${styles.texto_menu}`}>INATIVOS</h4>
                    </li>
                </Link>*/}

                {/* Botão de Logout */}
                <li id="logout" className={`${styles.div_navbar} ${styles.div_logout}`} onClick={handleLogout}>
                    <img src={logoutIcon} className={`${styles.item} ${styles.quadradinho_logout}`} alt="Ícone de logout" />
                    <h4 className={`${styles.item} ${styles.texto_menu}`}>SAIR</h4>
                </li>
            </nav>
        </div>
    );
};

export default MenuComponent;