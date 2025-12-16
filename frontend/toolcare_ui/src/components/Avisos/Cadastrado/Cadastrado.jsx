import React from "react";
import styles from "./cadastrado.module.css";
import { FaCheckCircle } from "react-icons/fa"; // Ícone de check

const CadastradoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <FaCheckCircle className={styles.icon} />
            <p>Cadastrado com sucesso</p>
        </div>
    );
};

export default CadastradoComponent;