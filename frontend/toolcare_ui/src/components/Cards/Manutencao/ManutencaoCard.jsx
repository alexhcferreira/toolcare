import React, { useState } from "react";
import styles from "./card_manutencao.module.css";
import ModalManutencao from "../../Modals/Manutencao/ModalManutencao";

const CardManutencao = ({ manutencao, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <div className={styles.card}>
                {/* Cabeçalho com Status Visual */}
                <div className={`${styles.header} ${manutencao.ativo ? styles.ativo : styles.inativo}`}>
                    <p className={styles.titulo}>{manutencao.nome}</p>
                    <span className={styles.badge}>{manutencao.ativo ? 'EM ANDAMENTO' : 'FINALIZADA'}</span>
                </div>
                
                <div className={styles.body}>
                    {/* Bloco Ferramenta */}
                    <div className={styles.block}>
                        <p className={styles.label}>Ferramenta</p>
                        <p className={styles.valueHighlight}>{manutencao.ferramenta_nome}</p>
                        <p className={styles.subValue}>{manutencao.ferramenta_numero_serie}</p>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Bloco Tipo */}
                    <div className={styles.block}>
                        <p className={styles.label}>Tipo</p>
                        <p className={styles.value} style={{textTransform: 'capitalize'}}>
                            {manutencao.tipo ? manutencao.tipo.toLowerCase() : 'N/A'}
                        </p>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Bloco Datas */}
                    <div className={styles.block}>
                        <p className={styles.label}>Período</p>
                        <p className={styles.dateValue}>
                            Início: {formatDate(manutencao.data_inicio)}
                        </p>
                        
                        <p 
                            className={styles.dateValue} 
                            style={{ 
                                marginTop: '0.3rem', 
                                color: manutencao.data_fim ? '#666' : '#f46524',
                                fontWeight: manutencao.data_fim ? 'normal' : 'bold'
                            }}
                        >
                            Fim: {manutencao.data_fim ? formatDate(manutencao.data_fim) : 'Em aberto'}
                        </p>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER DETALHES
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalManutencao
                    manutencao={manutencao}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardManutencao;