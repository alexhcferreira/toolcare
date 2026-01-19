import React, { useState, useContext } from "react";
import styles from "./modal_filial.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaCheck, FaTrash, FaEdit, FaUndo } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";

// Imports
import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import ReativadoComponent from "../../Avisos/Reativado/Reativado";
import DesejaReativarComponent from "../../Avisos/DesejaReativar/DesejaReativar";

import ConfirmarDesativacaoFilialComponent from "../../Avisos/ConfirmarDesativacaoFilial/ConfirmarDesativacaoFilial";
import BloqueioDesativarFilialComponent from "../../Avisos/BloqueioDesativarFilial/BloqueioDesativarFilial";

const ModalFilial = ({ filial, onClose, onUpdate }) => {
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

    // Reativação
    const [showReativarConfirm, setShowReativarConfirm] = useState(false);
    const [showReativado, setShowReativado] = useState(false);

    const [editData, setEditData] = useState({
        nome: filial.nome,
        cidade: filial.cidade
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.patch(`/api/filiais/${filial.id}/`, editData);
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

    const handleDeactivateClick = async () => {
        try {
            await api.patch(`/api/filiais/${filial.id}/desativar/?preview=true`);
            setShowConfirmacao(true);
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.lista_ferramentas) {
                setListaBloqueio(error.response.data.lista_ferramentas);
                setShowBloqueio(true);
            } else {
                setShowFalhaRemocao(true);
                setTimeout(() => setShowFalhaRemocao(false), 3000);
            }
        }
    };

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/filiais/${filial.id}/desativar/`);
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

    // --- REATIVAR ---
    const handleReativarClick = () => {
        setShowReativarConfirm(true);
    };

    const handleConfirmReativar = async () => {
        setShowReativarConfirm(false);
        try {
            await api.patch(`/api/filiais/${filial.id}/`, { ativo: true });
            setShowReativado(true);
            setTimeout(() => {
                setShowReativado(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao reativar:", error);
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
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999 }}>
                            <BloqueioDesativarFilialComponent 
                                listaFerramentas={listaBloqueio} 
                                onClose={() => setShowBloqueio(false)}
                            />
                        </div>
                    )}
                    {showConfirmacao && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99998 }}>
                            <ConfirmarDesativacaoFilialComponent 
                                onConfirm={handleConfirmDesativar} 
                                onCancel={() => setShowConfirmacao(false)} 
                            />
                        </div>
                    )}
                    {showReativarConfirm && (
                        <DesejaReativarComponent 
                            onConfirm={handleConfirmReativar} 
                            onCancel={() => setShowReativarConfirm(false)} 
                        />
                    )}
                </div>
            </div>

            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}
            {showReativado && <ReativadoComponent />}

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {!filial.ativo ? "Filial Inativa" : (isEditing ? "Editar Filial" : "Detalhes da Filial")}
                    </h2>

                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{filial.nome}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Cidade</label>
                        {isEditing ? (
                            <input className={styles.input} name="cidade" value={editData.cidade} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{filial.cidade}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {!filial.ativo ? (
                            // SE INATIVO: Apenas botão REATIVAR
                            <button className={styles.saveBtn} onClick={handleReativarClick} style={{backgroundColor: '#007bff'}}>
                                <FaUndo /> REATIVAR
                            </button>
                        ) : (
                            // SE ATIVO:
                            isEditing ? (
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
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalFilial;