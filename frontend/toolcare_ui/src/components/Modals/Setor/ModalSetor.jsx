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

const ModalSetor = ({ setor, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    
    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showRemovido, setShowRemovido] = useState(false);
    const [showFalhaRemocao, setShowFalhaRemocao] = useState(false);

    const [editData, setEditData] = useState({
        nome_setor: setor.nome_setor,
        descricao_setor: setor.descricao_setor || ''
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.patch(`/api/setores/${setor.id}/`, editData);
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

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            // Soft Delete padrão
            await api.patch(`/api/setores/${setor.id}/`, { ativo: false });
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
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {showConfirmacao && (
                    <ConfirmarRemocaoComponent 
                        onConfirm={handleConfirmDesativar} 
                        onCancel={() => setShowConfirmacao(false)} 
                    />
                )}

                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {isEditing ? "Editar Setor" : "Detalhes do Setor"}
                    </h2>

                    {/* NOME SETOR */}
                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome_setor" value={editData.nome_setor} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{setor.nome_setor}</p>
                        )}
                    </div>

                    {/* DESCRIÇÃO SETOR - Alterado para Input */}
                    <div className={styles.infoGroup}>
                        <label>Descrição</label>
                        {isEditing ? (
                            <input 
                                className={styles.input} 
                                name="descricao_setor" 
                                value={editData.descricao_setor} 
                                onChange={handleChange} 
                                placeholder="Descrição do setor"
                            />
                        ) : (
                            <p className={styles.textValue}>{setor.descricao_setor || "Sem descrição"}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {isEditing ? (
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <FaCheck /> SALVAR
                            </button>
                        ) : (
                            <>
                                {/* Apenas ADMIN ou MAXIMO editam setores */}
                                {(user?.tipo === 'ADMINISTRADOR' || user?.tipo === 'MAXIMO') && (
                                    <>
                                        <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                            EDITAR
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => setShowConfirmacao(true)}>
                                            <FaTrash /> DESATIVAR
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalSetor;