import React, { useState } from "react";
import styles from "../Filial/card_filial.module.css";
import ModalDeposito from "../../Modals/Deposito/ModalDeposito";
import { FaWarehouse, FaChevronRight } from "react-icons/fa";

const CardDeposito = ({ deposito, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={styles.card} onClick={() => setShowModal(true)}>
                <div className={styles.iconContainer}>
                    <FaWarehouse />
                </div>
                <div className={styles.infoContainer}>
                    <p className={styles.nome} title={deposito.nome}>{deposito.nome}</p>
                    {/* Mostra a qual filial pertence */}
                    <p className={styles.filial}>{deposito.filial_nome}</p>
                </div>
                <div className={styles.action}>
                    <FaChevronRight />
                </div>
            </div>

            {showModal && (
                <ModalDeposito
                    deposito={deposito}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardDeposito;