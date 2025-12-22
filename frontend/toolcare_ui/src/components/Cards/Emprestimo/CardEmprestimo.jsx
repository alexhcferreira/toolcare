import React, { useState } from "react";
import styles from "./card_emprestimo.module.css";
import ModalEmprestimo from "../../Modals/Emprestimo/ModalEmprestimo";

const CardEmprestimo = ({ emprestimo, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    // Formata data: 2023-12-25 -> 25/12/2023
    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <div className={styles.card}>
                {/* Cabeçalho com Status Visual */}
                <div className={`${styles.header} ${emprestimo.ativo ? styles.ativo : styles.inativo}`}>
                    <p className={styles.titulo}>{emprestimo.nome}</p>
                    <span className={styles.badge}>{emprestimo.ativo ? 'EM ANDAMENTO' : 'FINALIZADO'}</span>
                </div>
                
                <div className={styles.body}>
                    {/* Bloco Ferramenta */}
                    <div className={styles.block}>
                        <p className={styles.label}>Ferramenta</p>
                        <p className={styles.valueHighlight}>{emprestimo.ferramenta_nome}</p>
                        <p className={styles.subValue}>{emprestimo.ferramenta_numero_serie}</p>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Bloco Funcionário */}
                    <div className={styles.block}>
                        <p className={styles.label}>Funcionário</p>
                        <p className={styles.value}>{emprestimo.funcionario_nome}</p>
                        <p className={styles.subValue}>Matrícula: {emprestimo.funcionario_matricula}</p>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Bloco Data */}
                    <div className={styles.block}>
                        <p className={styles.label}>Período</p>
                        
                        {/* Data Início */}
                        <p className={styles.dateValue}>
                            Início: {formatDate(emprestimo.data_emprestimo)}
                        </p>
                        
                        {/* Data Fim (Logo abaixo) */}
                        <p 
                            className={styles.dateValue} 
                            style={{ 
                                marginTop: '0.3rem', 
                                color: emprestimo.data_devolucao ? '#666' : '#f46524',
                                fontWeight: emprestimo.data_devolucao ? 'normal' : 'bold'
                            }}
                        >
                            Fim: {emprestimo.data_devolucao ? formatDate(emprestimo.data_devolucao) : 'Em aberto'}
                        </p>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER DETALHES
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalEmprestimo
                    emprestimo={emprestimo}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardEmprestimo;