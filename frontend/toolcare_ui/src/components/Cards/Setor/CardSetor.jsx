import React, { useState } from "react";
import styles from "../Filial/card_filial.module.css";
import ModalSetor from "../../Modals/Setor/ModalSetor";
import { FaBriefcase, FaChevronRight } from "react-icons/fa";

const CardSetor = ({ setor, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={styles.card} onClick={() => setShowModal(true)}>
                <div className={styles.iconContainer}>
                    <FaBriefcase />
                </div>

                <div className={styles.infoContainer}>
                    <p className={styles.nome} title={setor.nome_setor}>
                        {setor.nome_setor}
                    </p>
                    <p className={styles.descricao} title={setor.descricao_setor}>
                        {setor.descricao_setor || "Sem descrição"}
                    </p>
                </div>

                <div className={styles.action}>
                    <FaChevronRight />
                </div>
            </div>

            {showModal && (
                <ModalSetor
                    setor={setor}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardSetor;