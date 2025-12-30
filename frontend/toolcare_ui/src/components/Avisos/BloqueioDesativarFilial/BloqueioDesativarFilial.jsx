import React from "react";
import styles from "./bloqueio_desativar_filial.module.css";
import { FaBan } from "react-icons/fa";

const BloqueioDesativarFilialComponent = ({ listaFerramentas = [], onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.alertBox}>
                <div className={styles.iconContainer}>
                    <FaBan className={styles.icon} />
                </div>

                <h3 className={styles.title}>Ação Bloqueada</h3>
                
                <p className={styles.messageText}>
                    Não é possível desativar esta filial pois existem ferramentas <strong>Emprestadas</strong> ou em <strong>Manutenção</strong> vinculadas a ela.
                </p>

                <p className={styles.subText}>
                    Resolva as pendências dos seguintes itens:
                </p>

                <div className={styles.listContainer}>
                    {listaFerramentas && listaFerramentas.length > 0 ? (
                        <ul className={styles.list}>
                            {listaFerramentas.map((item, index) => (
                                <li key={index} className={styles.listItem}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{color: '#999'}}>Lista de itens não carregada.</p>
                    )}
                </div>

                <button className={styles.closeButton} onClick={onClose}>
                    VOLTAR
                </button>
            </div>
        </div>
    );
};

export default BloqueioDesativarFilialComponent;