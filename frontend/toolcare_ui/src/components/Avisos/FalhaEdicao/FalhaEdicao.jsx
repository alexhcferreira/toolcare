import React from "react";
import styles from "../CSS/css_avisos.module.css";
import { MdClose } from "react-icons/md";

const FalhaEdicaoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <MdClose className={styles.icon} />
            <p>Não foi possível editar</p>
        </div>
    );
};

export default FalhaEdicaoComponent;