import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './usuario_cadastro.module.css';
import api from '../../../services/api'; 
import { AuthContext } from '../../../context/AuthContext';
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

// 1. IMPORTAR O HOOK DO REACT QUERY
import { useQueryClient } from '@tanstack/react-query';

// FUNÇÃO AUXILIAR DE VALIDAÇÃO DE CPF (Algoritmo padrão)
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length !== 11 || 
        cpf === "00000000000" || 
        cpf === "11111111111" || 
        cpf === "22222222222" || 
        cpf === "33333333333" || 
        cpf === "44444444444" || 
        cpf === "55555555555" || 
        cpf === "66666666666" || 
        cpf === "77777777777" || 
        cpf === "88888888888" || 
        cpf === "99999999999")
            return false;
    
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    
    return true;
};

const UsuarioCadastro = () => {
    const { user } = useContext(AuthContext);
    
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        password: '',
        tipo: '',
        filiais: []
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [tiposPermitidos, setTiposPermitidos] = useState([]);
    
    // Estados de Validação em Tempo Real
    const [senhaCurta, setSenhaCurta] = useState(false);
    const [senhasDiferentes, setSenhasDiferentes] = useState(false);
    
    // NOVOS ESTADOS PARA CPF
    const [cpfInvalido, setCpfInvalido] = useState(false); // Erro de formato/matemática
    const [cpfExistenteMsg, setCpfExistenteMsg] = useState(''); // Erro vindo do backend

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                // Trata paginação se houver
                const lista = response.data.results || response.data;
                
                const formatados = lista.map(f => ({
                    value: f.id,
                    label: `${f.nome} - ${f.cidade}`
                }));
                setFiliaisOptions(formatados);
            } catch (error) {
                console.error("Erro ao carregar filiais:", error);
            }
        };
        loadFiliais();

        if (user) {
            if (user.tipo === 'MAXIMO') {
                setTiposPermitidos([
                    { value: 'COORDENADOR', label: 'Coordenador' },
                    { value: 'ADMINISTRADOR', label: 'Administrador' },
                    { value: 'MAXIMO', label: 'Máximo' }
                ]);
            } else if (user.tipo === 'ADMINISTRADOR') {
                setFormData(prev => ({ ...prev, tipo: 'COORDENADOR' }));
            }
        }
    }, [user]);

    // Validação de Senha
    useEffect(() => {
        if (formData.password.length > 0 && formData.password.length < 6) {
            setSenhaCurta(true);
        } else {
            setSenhaCurta(false);
        }

        if (confirmPassword.length > 0 && formData.password !== confirmPassword) {
            setSenhasDiferentes(true);
        } else {
            setSenhasDiferentes(false);
        }
    }, [formData.password, confirmPassword]);

    // NOVA VALIDAÇÃO DE CPF EM TEMPO REAL
    useEffect(() => {
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        
        // Se estiver vazio, não mostra erro
        if (cpfLimpo.length === 0) {
            setCpfInvalido(false);
            return;
        }

        // Se tiver digitado os 11 números, valida a matemática
        if (cpfLimpo.length === 11) {
            const ehValido = validarCPF(cpfLimpo);
            setCpfInvalido(!ehValido);
        } else {
            // Enquanto não tem 11 digitos, não considera inválido ainda
            setCpfInvalido(false);
        }
    }, [formData.cpf]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        // Se alterar o CPF, limpa a mensagem de "Já existente" vinda do backend
        if (name === 'cpf') {
            setCpfExistenteMsg('');
        }

        if (name === 'tipo' && value !== 'COORDENADOR') {
            setFormData(prev => ({ ...prev, [name]: value, filiais: [] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFiliaisChange = (selectedOptions) => {
        setFormData({ ...formData, filiais: selectedOptions || [] });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Bloqueios de Front-end
        if (senhaCurta || senhasDiferentes || cpfInvalido) {
            return; 
        }

        // Valida se o CPF tem 11 dígitos antes de enviar
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            setCpfInvalido(true);
            return;
        }

        if (formData.tipo === 'COORDENADOR' && formData.filiais.length === 0) {
            setMsgErro("Coordenadores precisam de pelo menos uma filial.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const dataToSend = {
            nome: formData.nome,
            password: formData.password,
            tipo: formData.tipo,
            cpf: cpfLimpo,
            filiais: formData.filiais.map(item => item.value)
        };

        try {
            const response = await api.post('/api/usuarios/', dataToSend);
            console.log("Usuário cadastrado:", response.data);

            // 3. INVALIDAR O CACHE DA LISTA DE USUÁRIOS
            queryClient.invalidateQueries(['usuarios']);

            setShowSuccess(true);
            setShowError(false);
            
            setFormData({
                nome: '', 
                cpf: '', 
                password: '', 
                tipo: user.tipo === 'ADMINISTRADOR' ? 'COORDENADOR' : '', 
                filiais: []
            });
            setConfirmPassword('');
            setCpfExistenteMsg(''); // Limpa erros de CPF

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            // Lógica para capturar erro específico de CPF do Backend
            if (error.response?.data?.cpf) {
                // Se o erro for no campo CPF, define a mensagem específica para aparecer embaixo do input
                setCpfExistenteMsg(error.response.data.cpf[0]);
            } else {
                // Outros erros genéricos
                const msg = error.response?.data?.detail || "Erro ao cadastrar";
                console.error('Erro:', error.response?.data);
                setMsgErro(msg);
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            }
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/usuarios">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_usuario_form}
                >
                    <p id={styles.cadastro}>Cadastro de Usuário</p>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome Completo <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' name='nome' required
                            placeholder='Digite o nome'
                            value={formData.nome} onChange={handleChange}
                        />
                    </div>

                    {/* CPF COM VALIDAÇÃO VISUAL */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            CPF <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' name='cpf' required
                            placeholder='000.000.000-00'
                            value={formData.cpf} onChange={handleChange}
                            maxLength={14}
                            // Aplica borda vermelha se for inválido OU se o backend disse que já existe
                            className={cpfInvalido || cpfExistenteMsg ? styles.inputError : ''}
                        />
                        
                        {/* Mensagem de CPF Inválido (Matemática) */}
                        {cpfInvalido && (
                            <span className={styles.msgErroInput}>
                                CPF inválido.
                            </span>
                        )}

                        {/* Mensagem de CPF Existente (Backend) */}
                        {cpfExistenteMsg && (
                            <span className={styles.msgErroInput}>
                                {cpfExistenteMsg}
                            </span>
                        )}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Senha <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='password' name='password' required
                                placeholder='Mínimo 6 dígitos'
                                value={formData.password} onChange={handleChange}
                                className={senhaCurta ? styles.inputError : ''}
                            />
                            {senhaCurta && (
                                <span className={styles.msgErroInput}>
                                    A senha deve ter no mínimo 6 dígitos.
                                </span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Repita a Senha <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='password' 
                                name='confirmPassword' 
                                required
                                placeholder='Confirme a senha'
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={senhasDiferentes ? styles.inputError : ''}
                            />
                            {senhasDiferentes && (
                                <span className={styles.msgErroInput}>
                                    As senhas não coincidem.
                                </span>
                            )}
                        </div>
                    </div>

                    {user && user.tipo === 'MAXIMO' && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Tipo de Usuário <span className={styles.asterisk}>*</span>
                            </label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                className={`${styles.selectInput} ${formData.tipo === "" ? styles.emptySelect : ""}`}
                            >
                                <option value="">Selecione o Tipo...</option>
                                {tiposPermitidos.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.tipo === 'COORDENADOR' && (
                        <div className={styles.inputGroup} style={{animation: 'fadeIn 0.5s'}}>
                            <label className={styles.label}>
                                Filiais <span className={styles.asterisk}>*</span>
                            </label>
                            <Select
                                isMulti
                                placeholder="Selecione as filiais..."
                                noOptionsMessage={() => "Nenhuma filial disponível"}
                                styles={customSelectStyles}
                                options={filiaisOptions}
                                value={formData.filiais}
                                onChange={handleFiliaisChange}
                                closeMenuOnSelect={false}
                                isClearable
                                required
                            />
                        </div>
                    )}
                    
                    <button id={styles.enviar} type='submit'>
                        ENVIAR
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent message={msgErro} />}
            </div>
        </div>
    );
};

export default UsuarioCadastro;