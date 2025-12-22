import React, { useState, useEffect } from "react";
import styles from "./card_funcionario.module.css";
import ModalFuncionario from "../../Modals/Funcionario/ModalFuncionario";

import defaultImg from "../../../assets/defaults/default_funcionario.jpg"; 

const CardFuncionario = ({ funcionario, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(defaultImg);

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

    const listaFiliais = funcionario.filiais_detalhes
        ? funcionario.filiais_detalhes.map(f => f.nome).join(', ')
        : 'Sem filial';

    return (
        <>
            <div className={styles.card}>
                {/* CABEÇALHO (Mantido) */}
                <div className={styles.header}>
                    <p className={styles.nome} title={funcionario.nome}>
                        {funcionario.nome}
                    </p>
                    <span className={styles.badge}>
                        {funcionario.cargo_nome || 'Sem Cargo'}
                    </span>
                </div>

                <div className={styles.body}>
                    
                    {/* FOTO GRANDE E CENTRALIZADA */}
                    <div className={styles.avatarWrapper}>
                        <img 
                            src={imageSrc} 
                            alt={funcionario.nome} 
                            className={styles.avatar}
                            onError={(e) => { e.target.src = defaultImg; }}
                        />
                    </div>

                    {/* DADOS CENTRALIZADOS ABAIXO DA FOTO */}
                    <div className={styles.infoCenter}>
                        <div className={styles.block}>
                            <p className={styles.label}>Matrícula</p>
                            <p className={styles.valueBig}>{funcionario.matricula}</p>
                        </div>
                        
                        <div className={styles.block}>
                            <p className={styles.label}>Setor</p>
                            <p className={styles.value}>{funcionario.setor_nome || '-'}</p>
                        </div>
                    </div>

                    <div className={styles.separator}></div>

                    {/* FILIAIS */}
                    <div className={styles.blockFilial}>
                        <p className={styles.label} style={{textAlign: 'left'}}>Filiais</p>
                        <p className={styles.filiais} title={listaFiliais}>
                            {listaFiliais}
                        </p>
                    </div>
                    
                    <button className={styles.buttonCard} onClick={() => setShowModal(true)}>
                        VER DETALHES
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