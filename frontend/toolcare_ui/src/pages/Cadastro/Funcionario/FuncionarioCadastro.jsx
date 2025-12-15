import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './funcionario_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const FuncionarioCadastro = () => {
    // Estado do formulário
    const [formData, setFormData] = useState({
        nome: '',
        matricula: '',
        cpf: '',
        setor: '',
        cargo: '',
        filiais: [], // Array para múltiplas filiais
        foto: null   // Objeto do arquivo de imagem
    });

    // Estados para preencher os selects
    const [filiaisOptions, setFiliaisOptions] = useState([]);
    const [setoresOptions, setSetoresOptions] = useState([]);
    const [cargosOptions, setCargosOptions] = useState([]);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Carregar as opções do banco ao iniciar
    useEffect(() => {
        const loadOptions = async () => {
            try {
                // O backend já filtra as filiais baseado no usuário logado!
                const [filiaisRes, setoresRes, cargosRes] = await Promise.all([
                    api.get('/api/filiais/'),
                    api.get('/api/setores/'),
                    api.get('/api/cargos/')
                ]);

                setFiliaisOptions(filiaisRes.data);
                setSetoresOptions(setoresRes.data);
                setCargosOptions(cargosRes.data);
            } catch (error) {
                console.error("Erro ao carregar opções:", error);
            }
        };
        loadOptions();
    }, []);

    // Manipula campos de texto e selects simples
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manipula o Select Múltiplo de Filiais
    const handleMultiSelectChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setFormData({ ...formData, filiais: selectedOptions });
    };

    // Manipula o Upload de Arquivo
    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            setFormData({ ...formData, foto: event.target.files[0] });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // IMPORTANTE: Para enviar arquivos (fotos), usamos FormData em vez de JSON
        const dataToSend = new FormData();
        dataToSend.append('nome', formData.nome);
        dataToSend.append('matricula', formData.matricula);
        dataToSend.append('cpf', formData.cpf);
        dataToSend.append('setor', formData.setor);
        dataToSend.append('cargo', formData.cargo);
        
        // Adiciona cada ID de filial separadamente
        formData.filiais.forEach(id => dataToSend.append('filiais', id));

        if (formData.foto) {
            dataToSend.append('foto', formData.foto);
        }

        try {
            const response = await api.post('/api/funcionarios/', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Obrigatório para upload
                }
            });
            
            console.log("Funcionário cadastrado:", response.data);

            setShowSuccess(true);
            setShowError(false);
            
            // Limpa o form
            setFormData({
                nome: '', matricula: '', cpf: '', setor: '', cargo: '', filiais: [], foto: null
            });
            // Limpa o input de arquivo visualmente
            document.getElementById('fotoInput').value = "";

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            const msg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error('Erro ao cadastrar:', msg);
            setErrorMessage(msg); // Opcional: mostrar msg específica se quiser
            
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
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
                    
                    <input
                        type='text' name='nome' required
                        placeholder='Nome Completo'
                        value={formData.nome} onChange={handleChange}
                    />

                    {/* Linha dupla para CPF e Matrícula */}
                    <div className={styles.row}>
                        <input
                            type='text' name='cpf' required
                            placeholder='CPF (apenas números)'
                            value={formData.cpf} onChange={handleChange}
                            maxLength={14}
                        />
                         <input
                            type='text' name='matricula' required
                            placeholder='Matrícula'
                            value={formData.matricula} onChange={handleChange}
                        />
                    </div>
                    
                    {/* Selects de Setor e Cargo */}
                    <div className={styles.row}>
                        <select name="setor" value={formData.setor} onChange={handleChange} required className={styles.selectInput}>
                            <option value="" disabled>Selecione o Setor</option>
                            {setoresOptions.map(s => <option key={s.id} value={s.id}>{s.nome_setor}</option>)}
                        </select>

                        <select name="cargo" value={formData.cargo} onChange={handleChange} required className={styles.selectInput}>
                            <option value="" disabled>Selecione o Cargo</option>
                            {cargosOptions.map(c => <option key={c.id} value={c.id}>{c.nome_cargo}</option>)}
                        </select>
                    </div>

                    {/* Select Múltiplo de Filiais */}
                    <label className={styles.labelMulti}>
                        Filiais (Segure Ctrl para selecionar várias):
                    </label>
                    <select 
                        multiple 
                        name="filiais" 
                        value={formData.filiais} 
                        onChange={handleMultiSelectChange} 
                        required 
                        className={styles.multiSelect}
                    >
                        {filiaisOptions.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.nome} - {f.cidade}
                            </option>
                        ))}
                    </select>

                    {/* Upload de Foto */}
                    <label className={styles.labelFoto} htmlFor="fotoInput">Foto do Funcionário (Opcional)</label>
                    <input 
                        type="file" 
                        id="fotoInput"
                        name="foto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    
                    <button id={styles.enviar} type='submit'>
                        ENVIAR
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent />}
            </div>
        </div>
    );
};

export default FuncionarioCadastro;