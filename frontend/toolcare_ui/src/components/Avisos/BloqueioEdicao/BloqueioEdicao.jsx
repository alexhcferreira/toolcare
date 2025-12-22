import React from "react";
import styles from "../CSS/css_avisos.module.css";
import { MdClose } from "react-icons/md";

const BloqueioEdicaoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <MdClose className={styles.icon} />
            <p>Somente ferramentas disponíveis podem ser editadas ou desativadas</p>
        </div>
    );
};

export default BloqueioEdicaoComponent;