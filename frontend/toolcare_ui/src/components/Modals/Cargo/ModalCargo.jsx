import React, { useState, useContext } from "react";
import styles from "../Filial/modal_filial.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaCheck, FaTrash, FaEdit, FaUndo } from "react-icons/fa"; // Ícone de Undo para reativar
import { AuthContext } from "../../../context/AuthContext";

import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import ReativadoComponent from "../../Avisos/Reativado/Reativado";
import DesejaReativarComponent from "../../Avisos/DesejaReativar/DesejaReativar";

const ModalCargo = ({ cargo, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    
    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showRemovido, setShowRemovido] = useState(false);
    const [showFalhaRemocao, setShowFalhaRemocao] = useState(false);

    // Avisos de Reativação
    const [showReativarConfirm, setShowReativarConfirm] = useState(false);
    const [showReativado, setShowReativado] = useState(false); // Sucesso ao reativar

    const [editData, setEditData] = useState({
        nome_cargo: cargo.nome_cargo,
        descricao_cargo: cargo.descricao_cargo || ''
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.patch(`/api/cargos/${cargo.id}/`, editData);
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
            await api.patch(`/api/cargos/${cargo.id}/`, { ativo: false });
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

    // --- LÓGICA DE REATIVAÇÃO ---
    const handleReativarClick = () => {
        setShowReativarConfirm(true);
    };

    const handleConfirmReativar = async () => {
        setShowReativarConfirm(false);
        try {
            await api.patch(`/api/cargos/${cargo.id}/`, { ativo: true });
            
            setShowReativado(true); // Mostra aviso verde
            setTimeout(() => {
                setShowReativado(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao reativar:", error);
            setShowFalhaEdicao(true); // Reusa aviso de erro genérico
            setTimeout(() => setShowFalhaEdicao(false), 3000);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}
            
            {/* Aviso de Sucesso ao Reativar (Reusando Cadastrado ou crie um ReativadoComponent) */}
            {showReativado && <ReativadoComponent />} 

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                {/* CONFIRMAÇÃO DE DESATIVAÇÃO */}
                {showConfirmacao && (
                    <ConfirmarRemocaoComponent 
                        onConfirm={handleConfirmDesativar} 
                        onCancel={() => setShowConfirmacao(false)} 
                    />
                )}

                {/* CONFIRMAÇÃO DE REATIVAÇÃO */}
                {showReativarConfirm && (
                    <DesejaReativarComponent 
                        onConfirm={handleConfirmReativar} 
                        onCancel={() => setShowReativarConfirm(false)} 
                    />
                )}

                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {/* Título dinâmico */}
                        {!cargo.ativo ? "Cargo Inativo" : (isEditing ? "Editar Cargo" : "Detalhes do Cargo")}
                    </h2>

                    {/* NOME CARGO */}
                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome_cargo" value={editData.nome_cargo} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{cargo.nome_cargo}</p>
                        )}
                    </div>

                    {/* DESCRIÇÃO CARGO */}
                    <div className={styles.infoGroup}>
                        <label>Descrição</label>
                        {isEditing ? (
                            <input 
                                className={styles.input} 
                                name="descricao_cargo" 
                                value={editData.descricao_cargo} 
                                onChange={handleChange} 
                                placeholder="Descrição do cargo"
                            />
                        ) : (
                            <p className={styles.textValue}>{cargo.descricao_cargo || "Sem descrição"}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {/* LÓGICA DE BOTÕES CONDICIONAIS */}
                        
                        {!cargo.ativo ? (
                            // SE INATIVO: Apenas botão REATIVAR
                            <button className={styles.saveBtn} onClick={handleReativarClick} style={{backgroundColor: '#007bff'}}>
                                <FaUndo /> REATIVAR
                            </button>
                        ) : (
                            // SE ATIVO: Lógica normal de edição/desativação
                            isEditing ? (
                                <button className={styles.saveBtn} onClick={handleSave}>
                                    <FaCheck /> SALVAR
                                </button>
                            ) : (
                                <>
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
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalCargo;