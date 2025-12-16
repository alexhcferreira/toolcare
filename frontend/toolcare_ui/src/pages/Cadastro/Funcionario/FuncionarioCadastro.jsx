import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './funcionario_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

// FUNÇÃO AUXILIAR DE VALIDAÇÃO DE CPF
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || 
        cpf === "00000000000" || cpf === "11111111111" || 
        cpf === "22222222222" || cpf === "33333333333" || 
        cpf === "44444444444" || cpf === "55555555555" || 
        cpf === "66666666666" || cpf === "77777777777" || 
        cpf === "88888888888" || cpf === "99999999999")
            return false;
    
    let add = 0;
    for (let i = 0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    
    add = 0;
    for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    
    return true;
};

const FuncionarioCadastro = () => {
    const [formData, setFormData] = useState({
        nome: '',
        matricula: '',
        cpf: '',
        setor: null, 
        cargo: null, 
        filiais: [], 
        foto: null
    });

    const [fileName, setFileName] = useState('');
    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [setoresOptions, setSetoresOptions] = useState([]);
    const [cargosOptions, setCargosOptions] = useState([]);
    
    // Estados de Validação CPF
    const [cpfInvalido, setCpfInvalido] = useState(false);
    const [cpfExistenteMsg, setCpfExistenteMsg] = useState('');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [filiaisRes, setoresRes, cargosRes] = await Promise.all([
                    api.get('/api/filiais/'),
                    api.get('/api/setores/'),
                    api.get('/api/cargos/')
                ]);

                setFiliaisOptions(filiaisRes.data.map(f => ({
                    value: f.id,
                    label: `${f.nome} - ${f.cidade}`
                })));

                setSetoresOptions(setoresRes.data.map(s => ({
                    value: s.id,
                    label: s.nome_setor
                })));

                setCargosOptions(cargosRes.data.map(c => ({
                    value: c.id,
                    label: c.nome_cargo
                })));

            } catch (error) {
                console.error("Erro ao carregar opções:", error);
            }
        };
        loadOptions();
    }, []);

    // Validação de CPF em tempo real
    useEffect(() => {
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        
        if (cpfLimpo.length === 0) {
            setCpfInvalido(false);
            return;
        }

        if (cpfLimpo.length === 11) {
            const ehValido = validarCPF(cpfLimpo);
            setCpfInvalido(!ehValido);
        } else {
            setCpfInvalido(false);
        }
    }, [formData.cpf]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        // Limpa erro de backend se usuário digitar no CPF
        if (name === 'cpf') {
            setCpfExistenteMsg('');
        }

        if (name === 'matricula') {
            const apenasNumeros = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: apenasNumeros });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // ... (Handlers do React Select mantidos) ...
    const handleSetorChange = (selectedOption) => {
        setFormData({ ...formData, setor: selectedOption });
    };
    const handleCargoChange = (selectedOption) => {
        setFormData({ ...formData, cargo: selectedOption });
    };
    const handleFiliaisChange = (selectedOptions) => {
        setFormData({ ...formData, filiais: selectedOptions || [] });
    };
    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            setFormData({ ...formData, foto: file });
            setFileName(file.name);
        }
    };
    const formatFileName = (name) => {
        if (!name) return '';
        if (name.length > 40) {
            return name.substring(0, 37) + '...'; 
        }
        return name;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Bloqueio de Front-end para CPF inválido
        if (cpfInvalido) return;

        // Valida comprimento do CPF antes de enviar
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            setCpfInvalido(true);
            return;
        }

        if (formData.filiais.length === 0) {
            setErrorMessage("Selecione pelo menos uma filial.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('nome', formData.nome);
        dataToSend.append('matricula', formData.matricula);
        dataToSend.append('cpf', cpfLimpo);

        if (formData.setor) dataToSend.append('setor', formData.setor.value);
        if (formData.cargo) dataToSend.append('cargo', formData.cargo.value);
        
        formData.filiais.forEach(item => {
            dataToSend.append('filiais', item.value);
        });

        if (formData.foto) {
            dataToSend.append('foto', formData.foto);
        }

        try {
            const response = await api.post('/api/funcionarios/', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Funcionário cadastrado:", response.data);
            
            setShowSuccess(true);
            setShowError(false);
            
            setFormData({
                nome: '', matricula: '', cpf: '', 
                setor: null, cargo: null, filiais: [], 
                foto: null
            });
            setFileName('');
            setCpfExistenteMsg(''); // Reset do erro
            
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            // Lógica de tratamento de erro do CPF vindo do Backend
            if (error.response?.data?.cpf) {
                let msg = error.response.data.cpf[0];
                
                // Tradução manual caso o backend mande em inglês e não tenhamos alterado o serializer
                if (msg.includes("already exists")) {
                    msg = "Este CPF já está cadastrado no sistema.";
                }
                
                setCpfExistenteMsg(msg);
            } else {
                const msg = error.response?.data?.detail || "Erro ao cadastrar";
                console.error('Erro detalhado:', error.response?.data);
                setErrorMessage(msg);
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            }
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/funcionarios">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_funcionario_form}
                >
                    <p id={styles.cadastro}>Cadastro de Funcionário</p>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Nome Completo <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type='text' name='nome' required
                            placeholder='Ex: João da Silva'
                            value={formData.nome} onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                CPF <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='text' name='cpf' required
                                placeholder='000.000.000-00'
                                value={formData.cpf} onChange={handleChange}
                                maxLength={14}
                                // Aplica borda vermelha se tiver erro
                                className={cpfInvalido || cpfExistenteMsg ? styles.inputError : ''}
                            />
                            
                            {/* Erro Matemático */}
                            {cpfInvalido && (
                                <span className={styles.msgErroInput}>CPF inválido.</span>
                            )}

                            {/* Erro de Duplicidade Backend */}
                            {cpfExistenteMsg && (
                                <span className={styles.msgErroInput}>{cpfExistenteMsg}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Matrícula <span className={styles.asterisk}>*</span>
                            </label>
                            <input
                                type='text' name='matricula' required
                                placeholder='Ex: 57463'
                                value={formData.matricula} onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Setor</label>
                            <Select
                                placeholder="Selecione o setor"
                                noOptionsMessage={() => "Nenhum setor encontrado"}
                                styles={customSelectStyles}
                                options={setoresOptions}
                                value={formData.setor}
                                onChange={handleSetorChange}
                                isClearable
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Cargo</label>
                            <Select
                                placeholder="Selecione o cargo"
                                noOptionsMessage={() => "Nenhum cargo encontrado"}
                                styles={customSelectStyles}
                                options={cargosOptions}
                                value={formData.cargo}
                                onChange={handleCargoChange}
                                isClearable
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Filiais <span className={styles.asterisk}>*</span>
                        </label>
                        <Select
                            isMulti
                            placeholder="Selecione as filiais"
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

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Foto</label>
                        <label htmlFor="fotoInput" className={styles.customFileLabel}>
                            {fileName ? `${formatFileName(fileName)}` : "Clique para selecionar..."}
                        </label>
                        <input 
                            type="file" 
                            id="fotoInput"
                            name="foto"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.hiddenFileInput}
                        />
                    </div>
                    
                    <button id={styles.enviar} type='submit'>
                        ENVIAR
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent message={errorMessage} />}
            </div>
        </div>
    );
};

export default FuncionarioCadastro;