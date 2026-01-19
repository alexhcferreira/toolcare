import React, { useState, useEffect, useContext } from "react";
// Reutiliza CSS de FILIAL (Layout Coluna Única sem imagem)
import styles from "../Filial/modal_filial.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaCheck, FaTrash, FaEdit, FaUndo } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";

// --- IMPORTS EXATOS ---
import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import ReativadoComponent from "../../Avisos/Reativado/Reativado";
import DesejaReativarComponent from "../../Avisos/DesejaReativar/DesejaReativar";

import Select from 'react-select';
import { customSelectStyles } from '../../CustomSelect/selectStyles';

const ModalUsuario = ({ usuario, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext); 
    const [isEditing, setIsEditing] = useState(false);
    
    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [tiposPermitidos, setTiposPermitidos] = useState([]);

    // Avisos
    const [showEditado, setShowEditado] = useState(false);
    const [showFalhaEdicao, setShowFalhaEdicao] = useState(false);
    const [showConfirmacao, setShowConfirmacao] = useState(false);
    const [showRemovido, setShowRemovido] = useState(false);
    const [showFalhaRemocao, setShowFalhaRemocao] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    // Reativação
    const [showReativarConfirm, setShowReativarConfirm] = useState(false);
    const [showReativado, setShowReativado] = useState(false);

    const [editData, setEditData] = useState({
        nome: usuario.nome,
        cpf: usuario.cpf,
        tipo: usuario.tipo,
        password: '', 
        filiais: usuario.filiais_detalhes 
            ? usuario.filiais_detalhes.map(f => ({ value: f.id, label: `${f.nome} - ${f.cidade}` })) 
            : []
    });

    useEffect(() => {
        if (isEditing) {
            const loadOptions = async () => {
                try {
                    const response = await api.get('/api/filiais/');
                    // Lida com paginação se houver
                    const lista = response.data.results || response.data;
                    setFiliaisOptions(lista.map(f => ({ value: f.id, label: `${f.nome} - ${f.cidade}` })));
                } catch (error) {
                    console.error("Erro ao carregar filiais", error);
                }
            };
            loadOptions();

            if (user.tipo === 'MAXIMO') {
                setTiposPermitidos([
                    { value: 'COORDENADOR', label: 'Coordenador' },
                    { value: 'ADMINISTRADOR', label: 'Administrador' },
                    { value: 'MAXIMO', label: 'Máximo' }
                ]);
            } else {
                setTiposPermitidos([{ value: 'COORDENADOR', label: 'Coordenador' }]);
            }
        }
    }, [isEditing, user.tipo]);

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleFiliaisChange = (selectedOptions) => {
        setEditData({ ...editData, filiais: selectedOptions || [] });
    };

    const handleTipoChange = (e) => {
        const novoTipo = e.target.value;
        if (novoTipo !== 'COORDENADOR') {
            setEditData({ ...editData, tipo: novoTipo, filiais: [] });
        } else {
            setEditData({ ...editData, tipo: novoTipo });
        }
    };

    const handleSave = async () => {
        const payload = {
            nome: editData.nome,
            cpf: editData.cpf.replace(/\D/g, ''),
            tipo: editData.tipo,
            filiais: editData.filiais.map(f => f.value)
        };

        if (editData.password && editData.password.trim() !== '') {
            if (editData.password.length < 6) {
                alert("A senha deve ter no mínimo 6 dígitos.");
                return;
            }
            payload.password = editData.password;
        }

        try {
            await api.patch(`/api/usuarios/${usuario.id}/`, payload);
            setShowEditado(true);
            setTimeout(() => {
                setShowEditado(false);
                setIsEditing(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao atualizar:", error.response?.data);
            if (error.response?.data?.cpf) {
                setMsgErro("CPF já cadastrado.");
            }
            setShowFalhaEdicao(true);
            setTimeout(() => setShowFalhaEdicao(false), 3000);
        }
    };

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            await api.patch(`/api/usuarios/${usuario.id}/`, { ativo: false });
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
            await api.patch(`/api/usuarios/${usuario.id}/`, { ativo: true });
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
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}
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

                {/* CONTEÚDO (Sem Imagem) */}
                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {!usuario.ativo ? "Usuário Inativo" : (isEditing ? "Editar Usuário" : "Detalhes")}
                    </h2>

                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{usuario.nome}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>CPF</label>
                        {isEditing ? (
                            <>
                                <input className={styles.input} name="cpf" value={editData.cpf} onChange={handleChange} maxLength={14} />
                                {msgErro && <span style={{color:'#ff4d4d'}}>{msgErro}</span>}
                            </>
                        ) : (
                            <p className={styles.textValue}>{usuario.cpf}</p>
                        )}
                    </div>

                    {/* TIPO */}
                    <div className={styles.infoGroup}>
                        <label>Tipo de Acesso</label>
                        {isEditing ? (
                             user.tipo === 'ADMINISTRADOR' ? (
                                 <p className={styles.textHighlight}>{editData.tipo}</p>
                             ) : (
                                <select name="tipo" value={editData.tipo} onChange={handleTipoChange} className={styles.input}>
                                    {tiposPermitidos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                             )
                        ) : (
                            <p className={styles.textHighlight}>{usuario.tipo}</p>
                        )}
                    </div>

                    {/* FILIAIS (Só se for Coordenador) */}
                    {editData.tipo === 'COORDENADOR' && (
                        <div className={styles.infoGroup}>
                            <label>Filiais Vinculadas</label>
                            {isEditing ? (
                                <Select 
                                    isMulti 
                                    styles={customSelectStyles} 
                                    options={filiaisOptions} 
                                    value={editData.filiais} 
                                    onChange={handleFiliaisChange} 
                                    placeholder="Selecione..." 
                                    menuPosition="fixed" 
                                />
                            ) : (
                                <p className={styles.textValue} style={{fontSize: '1.4rem', color: '#f46524'}}>
                                    {usuario.filiais_detalhes && usuario.filiais_detalhes.length > 0 
                                        ? usuario.filiais_detalhes.map(f => f.nome).join(', ') 
                                        : 'Nenhuma filial vinculada'}
                                </p>
                            )}
                        </div>
                    )}

                    {/* SENHA (Só na edição e se estiver ativo) */}
                    {isEditing && usuario.ativo && (
                        <div className={styles.infoGroup} style={{marginTop: '1rem', borderTop: '1px solid #444', paddingTop: '1rem'}}>
                            <label style={{color: '#f46524'}}>Nova Senha (Opcional)</label>
                            <input 
                                className={styles.input} 
                                type="password" 
                                name="password" 
                                value={editData.password} 
                                onChange={handleChange} 
                                placeholder="Preencha apenas para alterar"
                            />
                        </div>
                    )}

                    <div className={styles.actions}>
                        {!usuario.ativo ? (
                            <button className={styles.saveBtn} onClick={handleReativarClick} style={{backgroundColor: '#007bff'}}>
                                <FaUndo /> REATIVAR
                            </button>
                        ) : (
                            isEditing ? (
                                <button className={styles.saveBtn} onClick={handleSave}><FaCheck /> SALVAR</button>
                            ) : (
                                <>
                                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}><FaEdit /> EDITAR</button>
                                    
                                    {(user.tipo === 'MAXIMO' || user.tipo === 'ADMINISTRADOR') && (
                                        <button className={styles.deleteBtn} onClick={() => setShowConfirmacao(true)}><FaTrash /> DESATIVAR</button>
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

export default ModalUsuario;