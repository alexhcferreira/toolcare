import React, { useState, useEffect } from "react";
import styles from "./modal_ferramenta.module.css";
import api from "../../../services/api";
import { FaTimes, FaEdit, FaTrash, FaCheck, FaFileAlt, FaCamera, FaUndo } from "react-icons/fa";


import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import ReativadoComponent from "../../Avisos/Reativado/Reativado";
import DesejaReativarComponent from "../../Avisos/DesejaReativar/DesejaReativar";
import AvisoEdicaoBloqueada from "../../Avisos/BloqueioEdicao/BloqueioEdicao";

import Select from 'react-select';
import { customSelectStyles } from '../../CustomSelect/selectStyles';
import defaultImg from "../../../assets/defaults/default_ferramenta.jpg";
import { gerarRelatorioFerramenta } from "../../../utils/reportGenerator";

const ModalFerramenta = ({ ferramenta, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [depositosOptions, setDepositosOptions] = useState([]);
    
    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showRemovido, setShowRemovido] = useState(false);
    const [showFalhaRemocao, setShowFalhaRemocao] = useState(false);
    const [showBloqueio, setShowBloqueio] = useState(false);

    // Reativação
    const [showReativarConfirm, setShowReativarConfirm] = useState(false);
    const [showReativado, setShowReativado] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({ numero_serie: '', data_aquisicao: '' });

    const [editData, setEditData] = useState({
        nome: ferramenta.nome,
        numero_serie: ferramenta.numero_serie,
        data_aquisicao: ferramenta.data_aquisicao,
        descricao: ferramenta.descricao || '',
        deposito: { value: ferramenta.deposito, label: ferramenta.deposito_nome },
        foto: null
    });

    const [fileName, setFileName] = useState('');
    const [imagePreview, setImagePreview] = useState(ferramenta.foto || defaultImg);

    useEffect(() => { setImagePreview(ferramenta.foto || defaultImg); }, [ferramenta.foto]);
    useEffect(() => { if (editData.foto) setImagePreview(URL.createObjectURL(editData.foto)); }, [editData.foto]);

    useEffect(() => {
        if (isEditing) {
            const loadDepositos = async () => {
                try {
                    const response = await api.get('/api/depositos/');
                    const lista = response.data.results || response.data;
                    const formatados = lista.map(d => ({
                        value: d.id,
                        label: `${d.nome} ${d.filial_nome ? `(${d.filial_nome})` : ''}`
                    }));
                    setDepositosOptions(formatados);
                } catch (error) {
                    console.error("Erro ao carregar depósitos", error);
                }
            };
            loadDepositos();
        }
    }, [isEditing]);

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    };

    const handleDepositoChange = (selectedOption) => { setEditData({ ...editData, deposito: selectedOption }); };
    
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setEditData({ ...editData, foto: e.target.files[0] });
            setFileName(e.target.files[0].name);
        }
    };

    const formatFileName = (name) => {
        if (!name) return '';
        if (name.length > 40) return name.substring(0, 37) + '...';
        return name;
    };

    const handleEditClick = () => {
        if (ferramenta.estado !== 'DISPONIVEL') {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setIsEditing(true);
    };

    const handleDeactivateClick = () => {
        if (ferramenta.estado !== 'DISPONIVEL') {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setShowConfirmacao(true);
    };

    const handleSave = async () => {
        const hoje = new Date().toISOString().split('T')[0];
        if (editData.data_aquisicao > hoje) {
            setFieldErrors(prev => ({ ...prev, data_aquisicao: 'Data não pode ser futura.' }));
            return;
        }

        const formData = new FormData();
        formData.append('nome', editData.nome);
        formData.append('numero_serie', editData.numero_serie);
        if (editData.data_aquisicao) formData.append('data_aquisicao', editData.data_aquisicao);
        formData.append('descricao', editData.descricao);
        formData.append('deposito', editData.deposito.value);
        if (editData.foto) formData.append('foto', editData.foto);

        try {
            await api.patch(`/api/ferramentas/${ferramenta.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowEditado(true);
            setTimeout(() => {
                setShowEditado(false);
                setIsEditing(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao atualizar:", error.response?.data);
            if (error.response?.data?.numero_serie) {
                let msg = error.response.data.numero_serie[0];
                if (msg.includes('already exists')) msg = "Nº de Série já existe.";
                setFieldErrors(prev => ({ ...prev, numero_serie: msg }));
            } else {
                setShowFalhaEdicao(true);
                setTimeout(() => setShowFalhaEdicao(false), 3000);
            }
        }
    };

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/ferramentas/${ferramenta.id}/desativar/`);
            setShowRemovido(true);
            setTimeout(() => {
                setShowRemovido(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error); 
            }
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
            // MUDANÇA: Chama o endpoint específico
            await api.patch(`/api/ferramentas/${ferramenta.id}/reativar/`);
            
            setShowReativado(true);
            setTimeout(() => {
                setShowReativado(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao reativar:", error);
            // Mostra erro genérico ou específico
            if (error.response?.data?.error) alert(error.response.data.error);
            setShowFalhaRemocao(true); // Reusa aviso de falha
            setTimeout(() => setShowFalhaRemocao(false), 3000);
        }
    };
    const handleGerarRelatorio = async () => {
        try {
            // Usa o número de série para filtrar exatamente o histórico desta ferramenta
            // Isso aproveita o sistema de busca que já implementamos no backend
            const params = {
                search_field: 'serial',
                search_value: ferramenta.numero_serie
            };

            const [emprestimosRes, manutencoesRes] = await Promise.all([
                api.get(`/api/emprestimos/`, { params }),
                api.get(`/api/manutencoes/`, { params })
            ]);

            const listaEmprestimos = emprestimosRes.data.results || emprestimosRes.data;
            const listaManutencoes = manutencoesRes.data.results || manutencoesRes.data;

            // Chama a função utilitária
            gerarRelatorioFerramenta(ferramenta, listaEmprestimos, listaManutencoes);

        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            alert("Erro ao buscar histórico para o relatório.");
        }
    };

    const formatStatus = (status) => {
        const map = { 'DISPONIVEL': 'Disponível', 'EMPRESTADA': 'Emprestada', 'EM_MANUTENCAO': 'Em Manutenção', 'INATIVA': 'Inativa' };
        return map[status] || status;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = defaultImg; 
        setImagePreview(defaultImg);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}
            {showBloqueio && (<AvisoEdicaoBloqueada />)}
            {showReativado && <ReativadoComponent />}

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                {showConfirmacao && (
                    <ConfirmarRemocaoComponent 
                        onConfirm={handleConfirmDesativar} 
                        onCancel={() => setShowConfirmacao(false)} 
                    />
                )}

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
                        {ferramenta.estado === 'INATIVA' ? "Ferramenta Inativa" : (isEditing ? "Editar Ferramenta" : "Detalhes")}
                    </h2>

                    {/* ... (Campos de Nome, Serial, Data, Descrição, Depósito mantidos) ... */}
                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} /> : <p className={styles.textValue}>{ferramenta.nome}</p>}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Número de Série</label>
                        {isEditing ? (
                            <>
                                <input className={`${styles.input} ${fieldErrors.numero_serie ? styles.inputError : ''}`} name="numero_serie" value={editData.numero_serie} onChange={handleChange} />
                                {fieldErrors.numero_serie && <span className={styles.errorMsg}>{fieldErrors.numero_serie}</span>}
                            </>
                        ) : <p className={styles.textValue}>{ferramenta.numero_serie}</p>}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Data de Aquisição</label>
                        {isEditing ? (
                            <>
                                <input type="date" className={`${styles.input} ${fieldErrors.data_aquisicao ? styles.inputError : ''}`} name="data_aquisicao" value={editData.data_aquisicao} onChange={handleChange} />
                                {fieldErrors.data_aquisicao && <span className={styles.errorMsg}>{fieldErrors.data_aquisicao}</span>}
                            </>
                        ) : <p className={styles.textValue}>{formatDate(ferramenta.data_aquisicao)}</p>}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Descrição</label>
                        {isEditing ? <textarea className={styles.textarea} name="descricao" value={editData.descricao} onChange={handleChange} rows="3" /> : <p className={styles.textValue}>{ferramenta.descricao || "Sem descrição."}</p>}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Depósito</label>
                        {isEditing ? (
                            <Select styles={customSelectStyles} options={depositosOptions} value={editData.deposito} onChange={handleDepositoChange} placeholder="Selecione..." menuPosition="fixed" />
                        ) : <p className={styles.textHighlight}>{ferramenta.deposito_nome || "N/A"}</p>}
                    </div>

                    {isEditing && (
                        <div className={styles.infoGroup}>
                            <label>Alterar Foto</label>
                            <label htmlFor="modalFotoInput" className={styles.customFileLabel}>
                                {fileName ? `Selecionado: ${formatFileName(fileName)}` : "Clique para selecionar nova foto..."}
                            </label>
                            <input type="file" id="modalFotoInput" accept="image/*" onChange={handleFileChange} className={styles.hiddenFileInput} />
                        </div>
                    )}

                    <div className={styles.infoGroup}>
                        <label>Estado Atual</label>
                        {isEditing ? (
                            <div className={styles.disabledInput}>{formatStatus(ferramenta.estado)}</div>
                        ) : (
                            <p className={styles.textValue} style={{
                                color: ferramenta.estado === 'DISPONIVEL' ? '#28a745' : 
                                       ferramenta.estado === 'EMPRESTADA' ? '#dc3545' : 
                                       ferramenta.estado === 'EM_MANUTENCAO' ? '#ffc107' : '#6c757d',
                                fontWeight: 'bold'
                            }}>
                                {formatStatus(ferramenta.estado)}
                            </p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {/* LÓGICA CONDICIONAL DE BOTÕES */}
                        {ferramenta.estado === 'INATIVA' ? (
                            <>
                                <button className={styles.saveBtn} onClick={handleReativarClick} style={{backgroundColor: '#007bff'}}>
                                    <FaUndo /> REATIVAR
                                </button>
                                <button className={styles.reportBtn} onClick={handleGerarRelatorio}>
                                    <FaFileAlt /> RELATÓRIO
                                </button>
                            </>
                        ) : (
                            isEditing ? (
                                <button className={styles.saveBtn} onClick={handleSave}>
                                    <FaCheck /> SALVAR
                                </button>
                            ) : (
                                <>
                                    <button className={styles.editBtn} onClick={handleEditClick}>
                                        <FaEdit /> EDITAR
                                    </button>
                                    <button className={styles.deleteBtn} onClick={handleDeactivateClick}>
                                        <FaTrash /> DESATIVAR
                                    </button>
                                    <button className={styles.reportBtn} onClick={handleGerarRelatorio}>
                                        <FaFileAlt /> RELATÓRIO
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalFerramenta;