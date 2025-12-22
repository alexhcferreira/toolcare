import React, { useState, useEffect } from "react";
import styles from "./card_funcionario.module.css";
import ModalFuncionario from "../../Modals/Funcionario/ModalFuncionario";

// Importe sua imagem default de funcionário
import defaultImg from "../../../assets/defaults/default_funcionario.jpg"; 

const CardFuncionario = ({ funcionario, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(defaultImg);

    // Pré-carregamento da imagem para evitar piscadas
    useEffect(() => {
        if (funcionario.foto) {
            const img = new Image();
            img.src = funcionario.foto;
            img.onload = () => setImageSrc(funcionario.foto);
            img.onerror = () => setImageSrc(defaultImg);
        } else {
            setImageSrc(defaultImg);
        }
    }, [funcionario.foto]);

    // Formata a lista de filiais para exibir (Ex: "Usina SP, Usina MG")
    const listaFiliais = funcionario.filiais_detalhes
        ? funcionario.filiais_detalhes.map(f => f.nome).join(', ')
        : 'Sem filial';

    return (
        <>
            <div className={styles.card}>
                <img 
                    src={imageSrc} 
                    alt={funcionario.nome} 
                    className={styles.cardImage}
                    onError={(e) => { e.target.src = defaultImg; }}
                />
                
                <div className={styles.fundo}>
                    <div className={styles.infoContainer}>
                        <p className={styles.nome}>{funcionario.nome}</p>
                        
                        <div className={styles.detalhes}>
                            {/* Matrícula */}
                            <p className={styles.matricula}>{funcionario.matricula}</p>
                            
                            {/* Lista de Filiais (Trunca se for muito grande via CSS) */}
                            <p className={styles.filiais} title={listaFiliais}>
                                {listaFiliais}
                            </p>
                        </div>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER MAIS
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalFuncionario
                    funcionario={funcionario}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate} 
                />
            )}
        </>
    );
};

export default CardFuncionario;