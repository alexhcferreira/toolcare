import React, { useState } from "react";
import styles from "./modal_emprestimo.module.css";
import api from "../../../services/api";
import { FaTimes, FaEdit, FaCheck, FaArchive } from "react-icons/fa";

// Imports de Componentes de Aviso (SEUS IMPORTS CORRETOS)
import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarFinalizacaoComponent from "../../Avisos/ConfirmarFinalizacao/ConfirmarFinalizacao";
import FinalizadoComponent from "../../Avisos/Finalizado/Finalizado";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import AvisoEdicaoBloqueada from "../../Avisos/BloqueioEdicao/BloqueioEdicao";

const ModalEmprestimo = ({ emprestimo, onClose, onUpdate }) => {
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
        nome: emprestimo.nome,
        data_devolucao: emprestimo.data_devolucao || '',
        observacoes: emprestimo.observacoes || ''
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Só permite editar se estiver ATIVO (Em andamento)
    const handleEditClick = () => {
        if (!emprestimo.ativo) {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Validação simples de data (apenas se tiver data preenchida)
        if (editData.data_devolucao && editData.data_devolucao < emprestimo.data_emprestimo) {
            alert("A data de devolução não pode ser anterior à data do empréstimo.");
            return;
        }

        // --- CORREÇÃO DO ERRO 400 ---
        // Cria um objeto payload para tratar os dados antes de enviar
        const payload = {
            nome: editData.nome,
            observacoes: editData.observacoes,
            // Se a data for string vazia, envia NULL, senão envia a data
            data_devolucao: editData.data_devolucao === '' ? null : editData.data_devolucao
        };

        try {
            await api.patch(`/api/emprestimos/${emprestimo.id}/`, payload);
            setShowEditado(true);
            setTimeout(() => {
                setShowEditado(false);
                setIsEditing(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao atualizar:", error.response?.data); // Log detalhado
            setShowFalhaEdicao(true);
            setTimeout(() => setShowFalhaEdicao(false), 3000);
        }
    };

    // FINALIZAR EMPRÉSTIMO
    const handleConfirmFinalizar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/emprestimos/${emprestimo.id}/`, { ativo: false });
            
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
        if (!emprestimo.ativo) return;
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
                        {isEditing ? "Editar Empréstimo" : "Detalhes do Empréstimo"}
                    </h2>

                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{emprestimo.nome}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Ferramenta</label>
                        <p className={styles.textHighlight}>{emprestimo.ferramenta_nome}</p>
                        <p className={styles.textValue} style={{fontSize: '1.4rem', color: '#ccc'}}>
                            Serial: {emprestimo.ferramenta_numero_serie}
                        </p>
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Funcionário</label>
                        <p className={styles.textHighlight}>{emprestimo.funcionario_nome}</p>
                        <p className={styles.textValue} style={{fontSize: '1.4rem', color: '#ccc'}}>
                            Matrícula: {emprestimo.funcionario_matricula}
                        </p>
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Data Início</label>
                        <p className={styles.textValue}>{formatDate(emprestimo.data_emprestimo)}</p>
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Data Devolução</label>
                        {isEditing ? (
                            <input
                                type={inputType}
                                name='data_devolucao' 
                                placeholder='Definir data'
                                onFocus={() => setInputType('date')}
                                onBlur={() => setInputType('text')}
                                value={inputType === 'date' ? editData.data_devolucao : formatDateToDisplay(editData.data_devolucao)}
                                onChange={handleChange}
                                className={styles.input}
                                min={emprestimo.data_emprestimo}
                            />
                        ) : (
                            <p className={styles.textValue}>{formatDate(emprestimo.data_devolucao) || "Em aberto"}</p>
                        )}
                    </div>

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
                            <p className={styles.textValue}>{emprestimo.observacoes || "Sem observações."}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {isEditing ? (
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <FaCheck /> SALVAR
                            </button>
                        ) : (
                            <>
                                {emprestimo.ativo && (
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

export default ModalEmprestimo;