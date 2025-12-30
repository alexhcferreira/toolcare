import React, { useState, useContext } from "react";
import styles from "./modal_filial.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaCheck, FaTrash, FaEdit } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";

// Imports
import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import AvisoEdicaoBloqueada from "../../Avisos/BloqueioEdicao/BloqueioEdicao";

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

    // --- NOVA LÓGICA DO BOTÃO DELETAR ---
    const handleDeactivateClick = async () => {
        try {
            // 1. Tenta simular a desativação (preview=true)
            await api.patch(`/api/filiais/${filial.id}/desativar/?preview=true`);
            
            // 2. Se não deu erro (caiu no 200 OK), significa que pode desativar.
            // Então mostramos a confirmação crítica.
            setShowConfirmacao(true);

        } catch (error) {
            console.error("Erro na verificação:", error.response);

            // 3. Se deu erro 400 com lista, é Bloqueio. Mostramos AGORA.
            if (error.response && error.response.status === 400 && error.response.data.lista_ferramentas) {
                setListaBloqueio(error.response.data.lista_ferramentas);
                setShowBloqueio(true);
            } else {
                // Outro erro qualquer
                setShowFalhaRemocao(true);
                setTimeout(() => setShowFalhaRemocao(false), 3000);
            }
        }
    };

    // --- EXECUÇÃO REAL APÓS CONFIRMAR ---
    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        
        try {
            // Agora chama SEM o preview para apagar de verdade
            await api.patch(`/api/filiais/${filial.id}/desativar/`);
            
            setShowRemovido(true);
            setTimeout(() => {
                setShowRemovido(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);

        } catch (error) {
            console.error("Erro ao desativar:", error);
            // Caso raro onde passou no preview mas falhou agora
            setShowFalhaRemocao(true);
            setTimeout(() => setShowFalhaRemocao(false), 3000);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* Avisos */}
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}

            {/* ZONA DE PROTEÇÃO DE BLOQUEIO */}
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

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {isEditing ? "Editar Filial" : "Detalhes da Filial"}
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
                        {isEditing ? (
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <FaCheck /> SALVAR
                            </button>
                        ) : (
                            <>
                                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                    <FaEdit /> EDITAR
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

export default ModalFilial;