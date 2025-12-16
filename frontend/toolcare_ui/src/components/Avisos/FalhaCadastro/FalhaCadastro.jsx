import React from "react";
import styles from "../FalhaCadastro/falha_cadastro.module.css";
import { MdClose } from "react-icons/md";

const FalhaCadastroComponent = () => {
    return (
        <div className={styles.successMessage}>
            <MdClose className={styles.icon} />
            <p>Falha no cadastro.</p>
        </div>
    );
};

export default FalhaCadastroComponent;