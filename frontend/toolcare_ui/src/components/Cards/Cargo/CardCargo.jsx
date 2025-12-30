import React, { useState } from "react";
import styles from "../Filial/card_filial.module.css";
import ModalCargo from "../../Modals/Cargo/ModalCargo";
import { FaBriefcase, FaChevronRight } from "react-icons/fa";

const CardCargo = ({ cargo, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={styles.card} onClick={() => setShowModal(true)}>
                <div className={styles.iconContainer}>
                    <FaBriefcase />
                </div>

                <div className={styles.infoContainer}>
                    <p className={styles.nome} title={cargo.nome_cargo}>
                        {cargo.nome_cargo}
                    </p>
                    <p className={styles.descricao} title={cargo.descricao_cargo}>
                        {cargo.descricao_cargo || "Sem descrição"}
                    </p>
                </div>

                <div className={styles.action}>
                    <FaChevronRight />
                </div>
            </div>

            {showModal && (
                <ModalCargo
                    cargo={cargo}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardCargo;