import React, { useState } from "react";
import styles from "./card_filial.module.css";
import ModalFilial from "../../Modals/Filial/ModalFilial";
import { FaBuilding, FaChevronRight } from "react-icons/fa"; // Ícones

const CardFilial = ({ filial, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* O card inteiro é clicável */}
            <div className={styles.card} onClick={() => setShowModal(true)}>
                
                {/* Ícone Representativo */}
                <div className={styles.iconContainer}>
                    <FaBuilding />
                </div>

                {/* Informações */}
                <div className={styles.infoContainer}>
                    <p className={styles.nome} title={filial.nome}>{filial.nome}</p>
                    <p className={styles.cidade}>{filial.cidade}</p>
                </div>

                {/* Indicador de Ação */}
                <div className={styles.action}>
                    <FaChevronRight />
                </div>
            </div>

            {showModal && (
                <ModalFilial
                    filial={filial}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardFilial;