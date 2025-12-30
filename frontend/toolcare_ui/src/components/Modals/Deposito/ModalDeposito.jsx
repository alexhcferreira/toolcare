import React, { useState, useContext } from "react";
// Reutilizando CSS de filial (Layout Coluna Única)
import styles from "../Filial/modal_filial.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaCheck, FaTrash, FaEdit } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";

import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import AvisoEdicaoBloqueada from "../../Avisos/BloqueioEdicao/BloqueioEdicao";

import ConfirmarDesativacaoDepositoComponent from "../../Avisos/ConfirmarDesativacaoDeposito/ConfirmarDesativacaoDeposito";
import BloqueioDesativarDepositoComponent from "../../Avisos/BloqueioDesativarDeposito/BloqueioDesativarDeposito";

const ModalDeposito = ({ deposito, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    
    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    const [showRemovido, setShowRemovido] = useState(false);
    const [showFalhaRemocao, setShowFalhaRemocao] = useState(false);
    
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showBloqueio, setShowBloqueio] = useState(false);
    const [listaBloqueio, setListaBloqueio] = useState([]);

    // Apenas o nome é editável
    const [editData, setEditData] = useState({
        nome: deposito.nome
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.patch(`/api/depositos/${deposito.id}/`, editData);
            setShowEditado(true);
            setTimeout(() => {
                setShowEditado(false);
                setIsEditing(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            setShowFalhaEdicao(true);
            setTimeout(() => setShowFalhaEdicao(false), 3000);
        }
    };

    const handleDeactivateClick = () => {
        // Tenta preview
        api.patch(`/api/depositos/${deposito.id}/desativar/?preview=true`)
            .then(() => setShowConfirmacao(true))
            .catch(error => {
                 if (error.response && error.response.status === 400 && error.response.data.lista_ferramentas) {
                    setListaBloqueio(error.response.data.lista_ferramentas);
                    setShowBloqueio(true);
                 } else {
                    setShowFalhaRemocao(true);
                    setTimeout(() => setShowFalhaRemocao(false), 3000);
                 }
            });
    };

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/depositos/${deposito.id}/desativar/`);
            setShowRemovido(true);
            setTimeout(() => {
                setShowRemovido(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao desativar:", error);
            setShowFalhaRemocao(true);
            setTimeout(() => setShowFalhaRemocao(false), 3000);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* Proteção contra fechamento acidental */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    {showBloqueio && (
                        <BloqueioDesativarDepositoComponent 
                            listaFerramentas={listaBloqueio} 
                            onClose={() => setShowBloqueio(false)}
                        />
                    )}
                    {showConfirmacao && (
                        <ConfirmarDesativacaoDepositoComponent 
                            onConfirm={handleConfirmDesativar} 
                            onCancel={() => setShowConfirmacao(false)} 
                        />
                    )}
                </div>
            </div>

            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {isEditing ? "Editar Depósito" : "Detalhes do Depósito"}
                    </h2>

                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{deposito.nome}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Filial</label>
                        {/* Sempre apenas texto, nunca input */}
                        <p className={styles.textHighlight}>{deposito.filial_nome}</p>
                    </div>

                    <div className={styles.actions}>
                        {isEditing ? (
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <FaCheck /> SALVAR
                            </button>
                        ) : (
                            <>
                                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                    EDITAR
                                </button>
                                
                                {user && user.tipo === 'MAXIMO' && (
                                    <button className={styles.deleteBtn} onClick={handleDeactivateClick}>
                                        <FaTrash /> DESATIVAR
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalDeposito;