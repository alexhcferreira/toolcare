import React from "react";
import styles from "../CSS/css_avisos.module.css";
import { MdClose } from "react-icons/md";

const BloqueioFuncionarioEmprestimoAtivoComponent = () => {
    return (
        <div className={styles.successMessage}>
            <MdClose className={styles.icon} />
            <p>Funcionários com empréstimos ativos não podem ser editados ou desativados.</p>
        </div>
    );
};

export default BloqueioFuncionarioEmprestimoAtivoComponent;