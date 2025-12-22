import React, { useState } from "react";
import styles from "../Emprestimo/modal_emprestimo.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaEdit, FaCheck, FaArchive } from "react-icons/fa";

import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarFinalizacaoComponent from "../../Avisos/ConfirmarFinalizacao/ConfirmarFinalizacao";
import FinalizadoComponent from "../../Avisos/Finalizado/Finalizado";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import AvisoEdicaoBloqueada from "../../Avisos/BloqueioEdicao/BloqueioEdicao";

const ModalManutencao = ({ manutencao, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showFinalizado, setShowFinalizado] = useState(false);
    const [showFalhaFinalizar, setShowFalhaFinalizar] = useState(false);
    const [showBloqueio, setShowBloqueio] = useState(false);

    const [inputType, setInputType] = useState('text');

    const [editData, setEditData] = useState({
        nome: manutencao.nome, // Agora editável
        data_fim: manutencao.data_fim || '',
        observacoes: manutencao.observacoes || ''
        // Tipo não precisa estar aqui pois não será enviado no PATCH
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditClick = () => {
        if (!manutencao.ativo) {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (editData.data_fim && editData.data_fim < manutencao.data_inicio) {
            alert("A data de fim não pode ser anterior à data de início.");
            return;
        }

        const payload = {
            nome: editData.nome, // Envia o novo nome
            observacoes: editData.observacoes,
            data_fim: editData.data_fim === '' ? null : editData.data_fim
        };

        try {
            await api.patch(`/api/manutencoes/${manutencao.id}/`, payload);
            setShowEditado(true);
            setTimeout(() => {
                setShowEditado(false);
                setIsEditing(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao atualizar:", error.response?.data);
            setShowFalhaEdicao(true);
            setTimeout(() => setShowFalhaEdicao(false), 3000);
        }
    };

    const handleConfirmFinalizar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/manutencoes/${manutencao.id}/`, { ativo: false });
            setShowFinalizado(true);
            setTimeout(() => {
                setShowFinalizado(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao finalizar:", error);
            setShowFalhaFinalizar(true);
            setTimeout(() => setShowFalhaFinalizar(false), 3000);
        }
    };

    const handleFinalizarClick = () => {
        if (!manutencao.ativo) return;
        setShowConfirmacao(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showFinalizado && <FinalizadoComponent />} 
            {showFalhaFinalizar && <FalhaRemocaoComponent />}
            {showBloqueio && <AvisoEdicaoBloqueada />}

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {showConfirmacao && (
                    <ConfirmarFinalizacaoComponent 
                        onConfirm={handleConfirmFinalizar} 
                        onCancel={() => setShowConfirmacao(false)} 
                    />
                )}

                <div className={styles.content}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>

                    <h2 className={styles.title}>
                        {isEditing ? "Editar Manutenção" : "Detalhes da Manutenção"}
                    </h2>

                    {/* NOME (Agora Editável) */}
                    <div className={styles.infoGroup}>
                        <label>Registro</label>
                        {isEditing ? (
                            <input 
                                className={styles.input} 
                                name="nome" 
                                value={editData.nome} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <p className={styles.textValue}>{manutencao.nome}</p>
                        )}
                    </div>

                    {/* FERRAMENTA (Somente Leitura) */}
                    <div className={styles.infoGroup}>
                        <label>Ferramenta</label>
                        <p className={styles.textHighlight}>{manutencao.ferramenta_nome}</p>
                        <p className={styles.textValue} style={{fontSize: '1.4rem', color: '#ccc'}}>
                            Serial: {manutencao.ferramenta_numero_serie}
                        </p>
                    </div>

                    {/* TIPO (Agora Imutável/Bloqueado) */}
                    <div className={styles.infoGroup}>
                        <label>Tipo</label>
                        {isEditing ? (
                            <div className={styles.disabledInput} style={{textTransform: 'capitalize'}}>
                                {manutencao.tipo ? manutencao.tipo.toLowerCase() : ''}
                            </div>
                        ) : (
                            <p className={styles.textValue} style={{textTransform: 'capitalize'}}>
                                {manutencao.tipo ? manutencao.tipo.toLowerCase() : ''}
                            </p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Data Início</label>
                        <p className={styles.textValue}>{formatDate(manutencao.data_inicio)}</p>
                    </div>

                    {/* DATA FIM (Editável) */}
                    <div className={styles.infoGroup}>
                        <label>Data Fim</label>
                        {isEditing ? (
                            <input
                                type={inputType}
                                name='data_fim' 
                                placeholder='Definir data'
                                onFocus={() => setInputType('date')}
                                onBlur={() => setInputType('text')}
                                value={inputType === 'date' ? editData.data_fim : formatDateToDisplay(editData.data_fim)}
                                onChange={handleChange}
                                className={styles.input}
                                min={manutencao.data_inicio}
                            />
                        ) : (
                            <p className={styles.textValue}>{formatDate(manutencao.data_fim) || "Em aberto"}</p>
                        )}
                    </div>

                    {/* OBSERVAÇÕES (Editável) */}
                    <div className={styles.infoGroup}>
                        <label>Observações</label>
                        {isEditing ? (
                            <textarea 
                                className={styles.textarea} 
                                name="observacoes" 
                                value={editData.observacoes} 
                                onChange={handleChange} 
                                rows="3" 
                            />
                        ) : (
                            <p className={styles.textValue}>{manutencao.observacoes || "Sem observações."}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {isEditing ? (
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <FaCheck /> SALVAR
                            </button>
                        ) : (
                            <>
                                {manutencao.ativo && (
                                    <>
                                        <button className={styles.editBtn} onClick={handleEditClick}>
                                            <FaEdit /> EDITAR
                                        </button>
                                        <button className={styles.deleteBtn} onClick={handleFinalizarClick}>
                                            <FaArchive /> FINALIZAR
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

export default ModalManutencao;