import React, { useState, useEffect } from "react";
import styles from "./card_ferramenta.module.css";
import ModalFerramenta from "../../Modals/Ferramenta/ModalFerramenta";

// Importe sua imagem local corretamente
import defaultImg from "../../../assets/defaults/default_ferramenta.jpg"; 

const CardFerramenta = ({ ferramenta, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    
    // O estado inicial é SEMPRE a imagem padrão (carregamento instantâneo)
    const [imageSrc, setImageSrc] = useState(defaultImg);

    // Efeito para carregar a imagem real em segundo plano
    useEffect(() => {
        // Se a ferramenta tiver uma URL de foto...
        if (ferramenta.foto) {
            const img = new Image();
            img.src = ferramenta.foto;
            
            // Só troca a imagem quando o navegador terminar de baixar ela completa
            img.onload = () => {
                setImageSrc(ferramenta.foto);
            };

            // Se der erro no download, mantém a padrão (não precisa fazer nada, pois já é o estado inicial)
            img.onerror = () => {
                setImageSrc(defaultImg);
            };
        } else {
            // Se não tiver foto no objeto, garante a padrão
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
                <img 
                    src={imageSrc} 
                    alt={ferramenta.nome} 
                    className={styles.cardImage}
                    // Mantemos o onError aqui como segurança extra
                    onError={(e) => { e.target.src = defaultImg; }}
                />
                
                <div className={styles.fundo}>
                    <div className={styles.infoContainer}>
                        <p className={styles.nome}>{ferramenta.nome}</p>
                        
                        <div className={styles.detalhes}>
                            <p className={styles.numSerie}>{ferramenta.numero_serie}</p>
                            
                            <p className={`${styles.status} ${styles[ferramenta.estado]}`}>
                                {formatStatus(ferramenta.estado)}
                            </p>
                        </div>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER MAIS
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