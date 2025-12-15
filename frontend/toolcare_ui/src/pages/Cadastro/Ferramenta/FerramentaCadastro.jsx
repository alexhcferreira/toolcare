import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ferramenta_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

const FerramentaCadastro = () => {
    const [formData, setFormData] = useState({
        nome: '',
        numero_serie: '',
        descricao: '',
        data_aquisicao: '',
        deposito: '',
        foto: null
    });

    const [fileName, setFileName] = useState('');
    const [depositosOptions, setDepositosOptions] = useState([]);
    
    // NOVO: Estado para controlar se mostra texto ou data
    const [inputType, setInputType] = useState('text');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const loadDepositos = async () => {
            try {
                const response = await api.get('/api/depositos/');
                setDepositosOptions(response.data);
            } catch (error) {
                console.error("Erro ao carregar depósitos:", error);
            }
        };
        loadDepositos();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            setFormData({ ...formData, foto: file });
            setFileName(file.name);
        }
    };

    // FUNÇÃO AUXILIAR: Transforma "2023-12-25" em "25/12/2023" para exibir
    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const dataToSend = new FormData();
        dataToSend.append('nome', formData.nome);
        dataToSend.append('numero_serie', formData.numero_serie);
        dataToSend.append('descricao', formData.descricao);
        dataToSend.append('data_aquisicao', formData.data_aquisicao);
        dataToSend.append('deposito', formData.deposito);
        
        if (formData.foto) {
            dataToSend.append('foto', formData.foto);
        }

        try {
            await api.post('/api/ferramentas/', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setShowSuccess(true);
            setShowError(false);
            
            setFormData({
                nome: '', numero_serie: '', descricao: '', 
                data_aquisicao: '', deposito: '', foto: null
            });
            setFileName('');
            // Volta o input para texto vazio
            setInputType('text');

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Erro ao cadastrar:', error.response ? error.response.data : error.message);
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/ferramentas">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_ferramenta_form}
                >
                    <p id={styles.cadastro}>Cadastro de Ferramenta</p>
                    
                    <div className={styles.row}>
                        <input
                            type='text' name='nome' required
                            placeholder='Nome da Ferramenta'
                            value={formData.nome} onChange={handleChange}
                        />
                        <input
                            type='text' name='numero_serie' required
                            placeholder='Nº de Série'
                            value={formData.numero_serie} onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <select 
                            name="deposito" 
                            value={formData.deposito} 
                            onChange={handleChange} 
                            required 
                            className={styles.selectInput}
                        >
                            <option value="" disabled>Selecione o Depósito</option>
                            {depositosOptions.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.nome} {d.filial_nome ? `(${d.filial_nome})` : ''}
                                </option>
                            ))}
                        </select>

                        {/* INPUT DE DATA MELHORADO */}
                        <input
                            type={inputType} // Muda dinamicamente entre 'text' e 'date'
                            name='data_aquisicao' 
                            required
                            placeholder='Data Aquisição'
                            
                            // Ao clicar (focar), vira calendário
                            onFocus={() => setInputType('date')}
                            
                            // Ao sair (blur), vira texto para mostrar formato BR
                            onBlur={() => setInputType('text')}
                            
                            // Lógica do valor:
                            // Se for tipo 'date' (focado), mostra o valor real (yyyy-mm-dd) para o navegador entender
                            // Se for tipo 'text' (desfocado), mostra o valor formatado (dd/mm/yyyy) para o usuário ler
                            value={inputType === 'date' ? formData.data_aquisicao : formatDateToDisplay(formData.data_aquisicao)}
                            
                            onChange={handleChange}
                            className={styles.dateInput} // Classe nova para ajustar ícone
                        />
                    </div>

                    <input
                        type='text' name='descricao'
                        placeholder='Descrição (Opcional)'
                        value={formData.descricao} onChange={handleChange}
                    />

                    <div className={styles.fileContainer}>
                        <label htmlFor="fotoInput" className={styles.customFileLabel}>
                            {fileName ? `Arquivo: ${fileName}` : "Clique para enviar foto"}
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
                {showError && <FalhaCadastroComponent />}
            </div>
        </div>
    );
};

export default FerramentaCadastro;