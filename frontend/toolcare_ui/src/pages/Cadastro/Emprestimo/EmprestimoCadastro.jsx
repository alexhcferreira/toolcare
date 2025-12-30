import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './emprestimo_cadastro.module.css';
import api from '../../../services/api'; 
import CadastradoComponent from '../../../components/Avisos/Cadastrado/Cadastrado';
import FalhaCadastroComponent from '../../../components/Avisos/FalhaCadastro/FalhaCadastro';

import Select from 'react-select';
import { customSelectStyles } from '../../../components/CustomSelect/selectStyles';

// 1. IMPORTAR O HOOK DO REACT QUERY
import { useQueryClient } from '@tanstack/react-query';

const EmprestimoCadastro = () => {
    // 2. INSTANCIAR O CLIENTE
    const queryClient = useQueryClient();

    const hoje = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        ferramenta: null, 
        funcionario: null,
        data_emprestimo: hoje, 
        observacoes: ''
    });

    const [ferramentasOptions, setFerramentasOptions] = useState([]);
    const [todosFuncionarios, setTodosFuncionarios] = useState([]); 
    const [funcionariosOptions, setFuncionariosOptions] = useState([]); 
    
    const [isFuncionarioDisabled, setIsFuncionarioDisabled] = useState(true);
    const [inputType, setInputType] = useState('text');

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [msgErro, setMsgErro] = useState('');

    useEffect(() => {
        const loadDados = async () => {
            try {
                const [ferramentasRes, funcionariosRes] = await Promise.all([
                    api.get('/api/ferramentas/'),
                    api.get('/api/funcionarios/')
                ]);

                // Tratamento para paginação (results ou data)
                const getList = (res) => res.data.results || res.data;

                const ferramentasFormatadas = getList(ferramentasRes)
                    .filter(f => f.estado === 'DISPONIVEL')
                    .map(f => ({
                        value: f.id,
                        label: `${f.nome} - ${f.numero_serie}`,
                        filial_nome: f.filial_nome 
                    }));
                
                setFerramentasOptions(ferramentasFormatadas);
                setTodosFuncionarios(getList(funcionariosRes)); 
                
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        loadDados();
    }, []);

    const handleFerramentaChange = (selectedOption) => {
        setFormData({ ...formData, ferramenta: selectedOption, funcionario: null }); 
        
        if (selectedOption) {
            const nomeFilialFerramenta = selectedOption.filial_nome;

            const filtrados = todosFuncionarios
                .filter(func => func.filiais_detalhes.some(filial => filial.nome === nomeFilialFerramenta))
                .map(func => ({
                    value: func.id,
                    label: `${func.nome} (${func.matricula})`
                }));

            setFuncionariosOptions(filtrados);
            setIsFuncionarioDisabled(false); 
        } else {
            setFuncionariosOptions([]);
            setIsFuncionarioDisabled(true);
        }
    };

    const handleFuncionarioChange = (selectedOption) => {
        setFormData({ ...formData, funcionario: selectedOption });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const formatDateToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.ferramenta || !formData.funcionario) {
            setMsgErro("Selecione a ferramenta e o funcionário.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        if (formData.data_emprestimo > hoje) {
            setMsgErro("A data do empréstimo não pode ser futura.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const payload = {
            ferramenta: formData.ferramenta.value,
            funcionario: formData.funcionario.value,
            data_emprestimo: formData.data_emprestimo,
            observacoes: formData.observacoes
        };

        try {
            const response = await api.post('/api/emprestimos/', payload);
            console.log("Empréstimo realizado:", response.data);

            // 3. INVALIDAR O CACHE
            queryClient.invalidateQueries(['emprestimos']);

            setShowSuccess(true);
            setShowError(false);
            
            setFormData({
                ferramenta: null,
                funcionario: null,
                data_emprestimo: hoje,
                observacoes: ''
            });
            setIsFuncionarioDisabled(true);
            setInputType('text');

            setFerramentasOptions(prev => prev.filter(f => f.value !== response.data.ferramenta));

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Erro:', error);
            setMsgErro(error.response?.data?.detail || "Erro ao realizar empréstimo");
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/emprestimos">
                <p id={styles.voltar}> <b>&lt;</b> </p>
            </Link>

            <div id={styles.tela} className={styles.tela}>
                <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                    id={styles.cadastro_emprestimo_form}
                >
                    <p id={styles.cadastro}>Novo Empréstimo</p>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Ferramenta <span className={styles.asterisk}>*</span>
                        </label>
                        <Select
                            placeholder="Selecione a ferramenta"
                            noOptionsMessage={() => "Nenhuma ferramenta disponível"}
                            styles={customSelectStyles} 
                            options={ferramentasOptions}
                            value={formData.ferramenta}
                            onChange={handleFerramentaChange}
                            isClearable 
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Funcionário <span className={styles.asterisk}>*</span>
                        </label>
                        <Select
                            placeholder={isFuncionarioDisabled ? "Selecione uma ferramenta primeiro" : "Pesquise o funcionário"}
                            noOptionsMessage={() => "Nenhum funcionário encontrado nesta filial"}
                            styles={customSelectStyles}
                            options={funcionariosOptions}
                            value={formData.funcionario}
                            onChange={handleFuncionarioChange}
                            isDisabled={isFuncionarioDisabled}
                            isClearable
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            Data de Início <span className={styles.asterisk}>*</span>
                        </label>
                        <input
                            type={inputType}
                            name='data_emprestimo' 
                            required
                            placeholder='Selecione a data'
                            onFocus={() => setInputType('date')}
                            onBlur={() => setInputType('text')}
                            value={inputType === 'date' ? formData.data_emprestimo : formatDateToDisplay(formData.data_emprestimo)}
                            onChange={handleChange}
                            className={styles.dateInput}
                            max={hoje}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Observações</label>
                        <textarea
                            name="observacoes"
                            placeholder="Digite observações"
                            value={formData.observacoes}
                            onChange={handleChange}
                            className={styles.textArea}
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <button id={styles.enviar} type='submit'>
                        CONFIRMAR EMPRÉSTIMO
                    </button>
                </form>

                {showSuccess && <CadastradoComponent />}
                {showError && <FalhaCadastroComponent message={msgErro} />}
            </div>
        </div>
    );
};

export default EmprestimoCadastro;