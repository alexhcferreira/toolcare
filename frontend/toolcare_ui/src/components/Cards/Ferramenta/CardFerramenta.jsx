import React, { useState, useEffect } from "react";
import styles from "./card_ferramenta.module.css";
import ModalFerramenta from "../../Modals/Ferramenta/ModalFerramenta";

import defaultImg from "../../../assets/defaults/default_ferramenta.jpg"; 

const CardFerramenta = ({ ferramenta, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(defaultImg);

    useEffect(() => {
        if (ferramenta.foto) {
            const img = new Image();
            img.src = ferramenta.foto;
            img.onload = () => setImageSrc(ferramenta.foto);
            img.onerror = () => setImageSrc(defaultImg);
        } else {
            setImageSrc(defaultImg);
        }
    }, [ferramenta.foto]);

    const formatStatus = (status) => {
        const map = {
            'DISPONIVEL': 'Disponível',
            'EMPRESTADA': 'Emprestada',
            'EM_MANUTENCAO': 'Em Manutenção',
            'INATIVA': 'Inativa'
        };
        return map[status] || status;
    };

    return (
        <>
            <div className={styles.card}>
                
                {/* CABEÇALHO LARANJA (Igual Funcionário) */}
                <div className={styles.header}>
                    <p className={styles.nome} title={ferramenta.nome}>
                        {ferramenta.nome}
                    </p>
                    
                    {/* Badge de Status no Cabeçalho */}
                    <span className={`${styles.statusBadge} ${styles[ferramenta.estado]}`}>
                        {formatStatus(ferramenta.estado)}
                    </span>
                </div>

                <div className={styles.body}>
                    
                    {/* IMAGEM CENTRALIZADA (Arredondada, não circular) */}
                    <div className={styles.imageWrapper}>
                        <img 
                            src={imageSrc} 
                            alt={ferramenta.nome} 
                            className={styles.cardImage}
                            onError={(e) => { e.target.src = defaultImg; }}
                        />
                    </div>
                    
                    {/* INFO CENTRALIZADA */}
                    <div className={styles.infoCenter}>
                        <div className={styles.block}>
                            <p className={styles.label}>Nº Série</p>
                            <p className={styles.valueBig}>{ferramenta.numero_serie}</p>
                        </div>
                    </div>

                    <div className={styles.separator}></div>

                    {/* DEPÓSITO (Alinhado a esquerda) */}
                    <div className={styles.blockDeposito}>
                        <p className={styles.label} style={{textAlign: 'left'}}>Localização</p>
                        <p className={styles.deposito} title={ferramenta.deposito_nome}>
                            {ferramenta.deposito_nome || "N/A"}
                        </p>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER DETALHES
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalFerramenta
                    ferramenta={ferramenta}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardFerramenta;