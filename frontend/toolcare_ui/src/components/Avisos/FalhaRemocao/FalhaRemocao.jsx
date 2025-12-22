import React from "react";
import styles from "../CSS/css_avisos.module.css";
import { MdClose } from "react-icons/md";

const FalhaRemocaoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <MdClose className={styles.icon} />
            <p>Não foi possível remover</p>
        </div>
    );
};

export default FalhaRemocaoComponent;