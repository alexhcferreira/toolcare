import React, { useState } from "react";
import styles from "./card_usuario.module.css";
import ModalUsuario from "../../Modals/Usuario/ModalUsuario";
import { FaUserShield, FaUserTie, FaUser, FaBuilding } from "react-icons/fa";

const CardUsuario = ({ usuario, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    // Define ícone e cor baseado no tipo
    const getTypeConfig = (type) => {
        switch (type) {
            case 'MAXIMO': return { label: 'Máximo', icon: <FaUserShield />, colorClass: styles.MAXIMO };
            case 'ADMINISTRADOR': return { label: 'Administrador', icon: <FaUserTie />, colorClass: styles.ADMINISTRADOR };
            default: return { label: 'Coordenador', icon: <FaUser />, colorClass: styles.COORDENADOR };
        }
    };

    const typeConfig = getTypeConfig(usuario.tipo);

    // Lógica para exibir filiais resumidas
    const renderFiliais = () => {
        if (usuario.tipo === 'MAXIMO' || usuario.tipo === 'ADMINISTRADOR') {
            return "Acesso Global";
        }
        if (!usuario.filiais_detalhes || usuario.filiais_detalhes.length === 0) {
            return "Sem vínculo";
        }
        const qtd = usuario.filiais_detalhes.length;
        if (qtd === 1) return usuario.filiais_detalhes[0].nome;
        return `${qtd} Filiais`;
    };

    return (
        <>
            <div className={styles.card}>
                {/* Barra de Topo Colorida */}
                <div className={`${styles.header} ${typeConfig.colorClass}`}>
                    <span className={styles.headerIcon}>{typeConfig.icon}</span>
                    <span className={styles.headerTitle}>{typeConfig.label}</span>
                </div>

                <div className={styles.body}>
                    <div className={styles.mainInfo}>
                        <p className={styles.nome} title={usuario.nome}>{usuario.nome}</p>
                        
                        <div className={styles.cpfContainer}>
                            <span className={styles.label}>CPF</span>
                            <span className={styles.value}>{usuario.cpf}</span>
                        </div>
                    </div>

                    <div className={styles.separator}></div>

                    <div className={styles.details}>
                        <div className={styles.detailRow}>
                            <FaBuilding className={styles.iconGray} />
                            <span className={styles.detailText} title={renderFiliais()}>
                                {renderFiliais()}
                            </span>
                        </div>
                        
                        {/* Status */}
                        <div className={styles.statusContainer}>
                            <span className={`${styles.statusBadge} ${usuario.ativo ? styles.ativo : styles.inativo}`}>
                                {usuario.ativo ? 'ATIVO' : 'INATIVO'}
                            </span>
                        </div>
                    </div>

                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER PERFIL
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalUsuario
                    usuario={usuario}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardUsuario;