import React from "react";
import styles from "./deseja_reativar.module.css";

const DesejaReativarComponent = ({ onConfirm, onCancel }) => {
    return (
        <div className={styles.removeMessage}>
            <p className={styles.messageText}>Deseja reativar o objeto?</p>
            <div className={styles.buttonContainer}>
                <button className={styles.confirmButton} onClick={onConfirm}>Sim</button>
                <button className={styles.cancelButton} onClick={onCancel}>Não</button>
            </div>
        </div>
    );
};

export default DesejaReativarComponent;