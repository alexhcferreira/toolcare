import React from "react";
import styles from "../ConfirmarDesativacaoFilial/confirmar_desativacao_filial.module.css";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmarDesativacaoDepositoComponent = ({ onConfirm, onCancel }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.alertBox}>
                
                {/* Ícone de Alerta */}
                <div className={styles.iconContainer}>
                    <FaExclamationTriangle className={styles.icon} />
                </div>

                <h3 className={styles.title}>Atenção! Ação Crítica</h3>
                
                <div className={styles.content}>
                    <p className={styles.mainText}>
                        Você está prestes a desativar este <strong>depósito</strong>.
                    </p>
                    <p className={styles.subText}>
                        Isso causará a <strong>desativação automática</strong> de todas as ferramentas vinculadas a ele.
                    </p>
                    <p className={styles.warning}>
                        As consequências dessa ação não podem ser desfeitas.
                    </p>
                </div>

                <div className={styles.actions}>
                    {/* Botão Vermelho agora é o CANCELAR (Não) */}
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        NÃO DESATIVAR
                    </button>

                    {/* Botão de Confirmar (Sim) mais discreto/técnico */}
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        DESATIVAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmarDesativacaoDepositoComponent;