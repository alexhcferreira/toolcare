import React from "react";
import styles from "../CSS/css_avisos.module.css";
import { FaCheckCircle } from "react-icons/fa"; // Ícone de check

const EditadoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <FaCheckCircle className={styles.icon} />
            <p>Editado com sucesso</p>
        </div>
    );
};

export default EditadoComponent;