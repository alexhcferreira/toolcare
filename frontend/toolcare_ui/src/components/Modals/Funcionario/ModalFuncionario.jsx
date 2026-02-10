import React, { useState, useEffect, useContext } from "react";
// Usando o CSS de Ferramenta para manter o padrão visual (Sem imagem lateral grande)
import styles from "../Ferramenta/modal_ferramenta.module.css"; 
import api from "../../../services/api";
import { FaTimes, FaEdit, FaTrash, FaCheck, FaFileAlt, FaCamera, FaUndo } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";
import { gerarRelatorioFuncionario } from "../../../utils/reportGenerator";

// Imports dos Componentes de Aviso
import EditadoComponent from "../../Avisos/Editado/Editado";
import FalhaEdicaoComponent from "../../Avisos/FalhaEdicao/FalhaEdicao";
import ConfirmarRemocaoComponent from "../../Avisos/ConfirmarRemocao/ConfirmarRemocao";
import RemovidoComponent from "../../Avisos/Removido/Removido";
import FalhaRemocaoComponent from "../../Avisos/FalhaRemocao/FalhaRemocao";
import BloqueioFuncionarioEmprestimoAtivoComponent from "../../Avisos/BloqueioFuncionarioEmprestimoAtivo/BloqueioFuncionarioEmprestimoAtivo";
import ReativadoComponent from "../../Avisos/Reativado/Reativado";
import DesejaReativarComponent from "../../Avisos/DesejaReativar/DesejaReativar";

import Select from 'react-select';
import { customSelectStyles } from '../../CustomSelect/selectStyles';
import defaultImg from "../../../assets/defaults/default_funcionario.jpg";

// FUNÇÃO DE VALIDAÇÃO DE CPF
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
};

const ModalFuncionario = ({ funcionario, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    
    // Opções
    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [setoresOptions, setSetoresOptions] = useState([]);
    const [cargosOptions, setCargosOptions] = useState([]);

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

    // Erros
    const [fieldErrors, setFieldErrors] = useState({
        cpf: '',
        matricula: '',
        filiais: ''
    });

    const [editData, setEditData] = useState({
        nome: funcionario.nome,
        matricula: funcionario.matricula,
        cpf: funcionario.cpf,
        setor: funcionario.setor ? { value: funcionario.setor, label: funcionario.setor_nome } : null,
        cargo: funcionario.cargo ? { value: funcionario.cargo, label: funcionario.cargo_nome } : null,
        filiais: funcionario.filiais_detalhes.map(f => ({ value: f.id, label: `${f.nome} - ${f.cidade}` })),
        foto: null
    });

    const [fileName, setFileName] = useState('');
    const imagePreview = editData.foto ? URL.createObjectURL(editData.foto) : (funcionario.foto || defaultImg);

    // Carregar opções ao editar
    useEffect(() => {
        if (isEditing) {
            const loadOptions = async () => {
                try {
                    const [filiaisRes, setoresRes, cargosRes] = await Promise.all([
                        api.get('/api/filiais/'),
                        api.get('/api/setores/'),
                        api.get('/api/cargos/')
                    ]);
                    
                    const getList = (res) => res.data.results || res.data;

                    setFiliaisOptions(getList(filiaisRes).map(f => ({ value: f.id, label: `${f.nome} - ${f.cidade}` })));
                    setSetoresOptions(getList(setoresRes).map(s => ({ value: s.id, label: s.nome_setor })));
                    setCargosOptions(getList(cargosRes).map(c => ({ value: c.id, label: c.nome_cargo })));
                } catch (error) {
                    console.error("Erro ao carregar opções", error);
                }
            };
            loadOptions();
        }
    }, [isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFieldErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'cpf' || name === 'matricula') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setEditData({ ...editData, [name]: onlyNums });
            
            if (name === 'cpf') {
                if (onlyNums.length === 11 && !validarCPF(onlyNums)) {
                    setFieldErrors(prev => ({ ...prev, cpf: 'CPF inválido.' }));
                }
            }
        } else {
            setEditData({ ...editData, [name]: value });
        }
    };

    const handleSetorChange = (opt) => setEditData({ ...editData, setor: opt });
    const handleCargoChange = (opt) => setEditData({ ...editData, cargo: opt });
    const handleFiliaisChange = (opts) => {
        setEditData({ ...editData, filiais: opts || [] });
        if (opts && opts.length > 0) setFieldErrors(prev => ({ ...prev, filiais: '' }));
    };
    
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setEditData({ ...editData, foto: e.target.files[0] });
            setFileName(e.target.files[0].name);
        }
    };

    const formatFileName = (name) => {
        if (!name) return '';
        if (name.length > 30) return name.substring(0, 27) + '...';
        return name;
    };

    // --- LÓGICA DE BLOQUEIO POR EMPRÉSTIMO ATIVO ---
    const verificarEmprestimosAtivos = async () => {
        try {
            const response = await api.get(`/api/emprestimos/?funcionario=${funcionario.id}&ativo=true`);
            const lista = response.data.results || response.data;
            return lista.length > 0;
        } catch (error) {
            console.error("Erro ao verificar empréstimos:", error);
            return true; 
        }
    };

    const handleEditClick = async () => {
        if (!funcionario.ativo) return; // Segurança extra
        const temEmprestimos = await verificarEmprestimosAtivos();
        if (temEmprestimos) {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setIsEditing(true);
    };

    const handleDeactivateClick = async () => {
        const temEmprestimos = await verificarEmprestimosAtivos();
        if (temEmprestimos) {
            setShowBloqueio(true);
            setTimeout(() => setShowBloqueio(false), 3000);
            return;
        }
        setShowConfirmacao(true);
    };

    const handleSave = async () => {
        let errors = {};
        if (editData.cpf.length !== 11 || !validarCPF(editData.cpf)) errors.cpf = "CPF inválido.";
        if (!editData.filiais || editData.filiais.length === 0) errors.filiais = "Selecione ao menos uma filial.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        const formData = new FormData();
        formData.append('nome', editData.nome);
        formData.append('matricula', editData.matricula);
        formData.append('cpf', editData.cpf);
        formData.append('setor', editData.setor ? editData.setor.value : '');
        formData.append('cargo', editData.cargo ? editData.cargo.value : '');
        
        editData.filiais.forEach(f => formData.append('filiais', f.value));

        if (editData.foto) formData.append('foto', editData.foto);

        try {
            await api.patch(`/api/funcionarios/${funcionario.id}/`, formData, {
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
            if (error.response?.data) {
                const backendErrors = {};
                if (error.response.data.cpf) {
                    let msg = error.response.data.cpf[0];
                    if (msg.includes('already exists')) msg = "CPF já cadastrado.";
                    backendErrors.cpf = msg;
                }
                if (error.response.data.matricula) {
                    let msg = error.response.data.matricula[0];
                    if (msg.includes('already exists')) msg = "Matrícula já cadastrada.";
                    backendErrors.matricula = msg;
                }
                if (Object.keys(backendErrors).length > 0) {
                    setFieldErrors(prev => ({ ...prev, ...backendErrors }));
                } else {
                    setShowFalhaEdicao(true);
                    setTimeout(() => setShowFalhaEdicao(false), 3000);
                }
            } else {
                setShowFalhaEdicao(true);
                setTimeout(() => setShowFalhaEdicao(false), 3000);
            }
        }
    };

    const handleConfirmDesativar = async () => {
        setShowConfirmacao(false);
        try {
            // Tenta usar endpoint customizado se existir, senão patch normal de ativo=False
            // Se tiver criado endpoint 'desativar' no backend, use: `/api/funcionarios/${funcionario.id}/desativar/`
            await api.patch(`/api/funcionarios/${funcionario.id}/`, { ativo: false });
            
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
            await api.patch(`/api/funcionarios/${funcionario.id}/reativar/`);
            setShowReativado(true);
            setTimeout(() => {
                setShowReativado(false);
                if (onUpdate) onUpdate();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Erro ao reativar:", error);
            if (error.response?.data?.error) alert(error.response.data.error);
            setShowFalhaRemocao(true); // Reusa aviso de falha genérico
            setTimeout(() => setShowFalhaRemocao(false), 3000);
        }
    };

    const handleGerarRelatorio = async () => {
        try {
            // Busca histórico filtrando pelo ID do funcionário
            const response = await api.get(`/api/emprestimos/?funcionario=${funcionario.id}`);
            
            // Trata paginação
            const listaEmprestimos = response.data.results || response.data;

            // Gera PDF
            gerarRelatorioFuncionario(funcionario, listaEmprestimos);

        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            alert("Erro ao buscar histórico.");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            {showEditado && <EditadoComponent />}
            {showFalhaEdicao && <FalhaEdicaoComponent />}
            {showRemovido && <RemovidoComponent />}
            {showFalhaRemocao && <FalhaRemocaoComponent />}
            {showBloqueio && <BloqueioFuncionarioEmprestimoAtivoComponent />}
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
                        {!funcionario.ativo ? "Funcionário Inativo" : (isEditing ? "Editar Funcionário" : "Detalhes")}
                    </h2>

                    {/* ... (Campos Nome, CPF, Matricula, Setor, Cargo, Filiais mantidos) ... */}
                    <div className={styles.infoGroup}>
                        <label>Nome</label>
                        {isEditing ? (
                            <input className={styles.input} name="nome" value={editData.nome} onChange={handleChange} />
                        ) : (
                            <p className={styles.textValue}>{funcionario.nome}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>CPF</label>
                        {isEditing ? (
                            <>
                                <input className={`${styles.input} ${fieldErrors.cpf ? styles.inputError : ''}`} name="cpf" value={editData.cpf} onChange={handleChange} maxLength={14} />
                                {fieldErrors.cpf && <span className={styles.errorMsg}>{fieldErrors.cpf}</span>}
                            </>
                        ) : (
                            <p className={styles.textValue}>{funcionario.cpf}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Matrícula</label>
                        {isEditing ? (
                            <>
                                <input className={`${styles.input} ${fieldErrors.matricula ? styles.inputError : ''}`} name="matricula" value={editData.matricula} onChange={handleChange} />
                                {fieldErrors.matricula && <span className={styles.errorMsg}>{fieldErrors.matricula}</span>}
                            </>
                        ) : (
                            <p className={styles.textValue}>{funcionario.matricula}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Setor</label>
                        {isEditing ? (
                            <Select styles={customSelectStyles} options={setoresOptions} value={editData.setor} onChange={handleSetorChange} placeholder="Selecione..." menuPosition="fixed" isClearable />
                        ) : (
                            <p className={styles.textHighlight}>{funcionario.setor_nome || "N/A"}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Cargo</label>
                        {isEditing ? (
                            <Select styles={customSelectStyles} options={cargosOptions} value={editData.cargo} onChange={handleCargoChange} placeholder="Selecione..." menuPosition="fixed" isClearable />
                        ) : (
                            <p className={styles.textHighlight}>{funcionario.cargo_nome || "N/A"}</p>
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <label>Filiais</label>
                        {isEditing ? (
                            <>
                                <Select isMulti styles={customSelectStyles} options={filiaisOptions} value={editData.filiais} onChange={handleFiliaisChange} placeholder="Selecione as filiais..." menuPosition="fixed" />
                                {fieldErrors.filiais && <span className={styles.errorMsg}>{fieldErrors.filiais}</span>}
                            </>
                        ) : (
                            <p className={styles.textHighlight} style={{color: '#f46524'}}>
                                {funcionario.filiais_detalhes.map(f => f.nome).join(', ')}
                            </p>
                        )}
                    </div>

                    {isEditing && (
                        <div className={styles.infoGroup}>
                            <label>Alterar Foto</label>
                            <label htmlFor="modalFotoInput" className={styles.customFileLabel}>
                                {fileName ? `Selecionado: ${formatFileName(fileName)}` : "Clique para selecionar nova foto..."}
                            </label>
                            <input 
                                type="file" 
                                id="modalFotoInput"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.hiddenFileInput}
                            />
                        </div>
                    )}

                    <div className={styles.actions}>
                        {!funcionario.ativo ? (
                            // SE INATIVO: Reativar + Relatório
                            <>
                                <button className={styles.saveBtn} onClick={handleReativarClick} style={{backgroundColor: '#007bff'}}>
                                    <FaUndo /> REATIVAR
                                </button>
                                <button className={styles.reportBtn} onClick={handleGerarRelatorio}>
                                    <FaFileAlt /> RELATÓRIO
                                </button>
                            </>
                        ) : (
                            // SE ATIVO:
                            isEditing ? (
                                <button className={styles.saveBtn} onClick={handleSave}><FaCheck /> SALVAR</button>
                            ) : (
                                <>
                                    <button className={styles.editBtn} onClick={handleEditClick}><FaEdit /> EDITAR</button>
                                    <button className={styles.deleteBtn} onClick={handleDeactivateClick}><FaTrash /> DESATIVAR</button>
                                    <button className={styles.reportBtn} onClick={handleGerarRelatorio}><FaFileAlt /> RELATÓRIO</button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalFuncionario;