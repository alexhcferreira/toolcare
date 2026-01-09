import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ferramenta.module.css';
import api from '../../../services/api';
import CardFerramenta from '../../../components/Cards/Ferramenta/CardFerramenta';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// IMPORTS NOVOS
import Select from 'react-select';
import { filterSelectStyles } from '../../../components/CustomSelect/filterSelectStyles'; // Estilo branco

const Ferramenta = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    
    // Filtros (Objetos do React Select)
    const [filialSelecionada, setFilialSelecionada] = useState(null); 
    const [campoBusca, setCampoBusca] = useState({ value: 'global', label: 'Todos os campos' });
    
    // Estado específico para o Multi-Select de Status
    const [statusSelecionados, setStatusSelecionados] = useState([]);

    const [listaFiliais, setListaFiliais] = useState([]);
    const queryClient = useQueryClient();

    // Opções de Campos
    const opcoesCampos = [
        { value: 'global', label: 'Todos os campos' },
        { value: 'nome', label: 'Nome' },
        { value: 'numero_serie', label: 'Nº de Série' },
        { value: 'descricao', label: 'Descrição' },
        { value: 'deposito', label: 'Depósito' },
        { value: 'estado', label: 'Estado' },
        { value: 'data_aquisicao', label: 'Data Aquisição' }
    ];

    // Opções de Status
    const opcoesStatus = [
        { value: 'DISPONIVEL', label: 'Disponível' },
        { value: 'EMPRESTADA', label: 'Emprestada' },
        { value: 'EM_MANUTENCAO', label: 'Em Manutenção' }
    ];

    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                const dados = response.data.results || response.data;
                const formatados = dados.map(f => ({ value: f.id, label: f.nome }));
                // Adiciona opção "Todas" no início
                formatados.unshift({ value: '', label: 'Todas as Filiais' } );
                setListaFiliais(formatados);
            } catch (error) {
                console.error("Erro ao carregar filiais", error);
            }
        };
        loadFiliais();
    }, []);

    // Debounce do Input de Texto
    useEffect(() => {
        const timer = setTimeout(() => {
            setBuscaDebounced(buscaInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    useEffect(() => {
        if (campoBusca.value !== 'estado') {
            setStatusSelecionados([]);
        }
    }, [campoBusca]);

    const fetchFerramentas = async ({ pageParam = 1 }) => {
        const params = { 
            page: pageParam,
            somente_disponiveis_emprestadas_manutencao: 'true' 
        };

        // 1. Filtro de Filial
        if (filialSelecionada && filialSelecionada.value) {
            params.filial = filialSelecionada.value;
        }

        // 2. Lógica de Campos Específicos
        if (campoBusca.value === 'global') {
            params.search = buscaDebounced;
        } else if (campoBusca.value === 'estado') {
            // Envia status separados por vírgula (ex: "DISPONIVEL,EMPRESTADA")
            if (statusSelecionados.length > 0) {
                params.search_field = 'estado';
                params.search_value = statusSelecionados.map(s => s.value).join(',');
            }
        } else {
            // Outros campos (Texto ou Data)
            if (buscaDebounced) {
                params.search_field = campoBusca.value;
                params.search_value = buscaDebounced;
            }
        }

        const response = await api.get(`/api/ferramentas/`, { params });
        return response.data; 
    };

    // React Query Key complexa: recarrega se qualquer filtro mudar
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading, 
    } = useInfiniteQuery({
        queryKey: ['ferramentas', buscaDebounced, filialSelecionada, campoBusca, statusSelecionados, 'somente_disponiveis_emprestadas_manutencao'], 
        queryFn: fetchFerramentas,
        getNextPageParam: (lastPage) => {
            if (!lastPage.next) return undefined;
            const url = new URL(lastPage.next);
            return url.searchParams.get('page');
        },
        keepPreviousData: true 
    });

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleUpdate = () => {
        queryClient.invalidateQueries(['ferramentas']);
    };

    return (
        <div className={styles.container}>
            <Link to="/ferramenta_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                
                {/* 1. SELECT FILIAL (React-Select) */}
                <div style={{ width: '220px' }}>
                    <Select
                        options={listaFiliais}
                        value={filialSelecionada}
                        onChange={setFilialSelecionada}
                        placeholder="Todas as Filiais"
                        styles={filterSelectStyles}
                        isSearchable={false} // Remove cursor de texto
                    />
                </div>

                <div className={styles.divider}></div>

                {/* 2. SELECT CATEGORIA */}
                <div style={{ width: '200px' }}>
                    <Select
                        options={opcoesCampos}
                        value={campoBusca}
                        onChange={(opt) => {
                            setCampoBusca(opt);
                            setBuscaInput(''); // Limpa texto ao trocar categoria
                            setStatusSelecionados([]); // Limpa status
                        }}
                        styles={filterSelectStyles}
                        isSearchable={false}
                    />
                </div>

                <div className={styles.divider}></div>

                {/* 3. ÁREA DINÂMICA (Input Texto OU Select Estado) */}
                <div style={{ flex: 1 }}>
                    {campoBusca.value === 'estado' ? (
                        <Select
                            isMulti
                            options={opcoesStatus}
                            value={statusSelecionados}
                            onChange={setStatusSelecionados}
                            placeholder="Selecione os estados..."
                            styles={filterSelectStyles}
                            closeMenuOnSelect={false}
                        />
                    ) : (
                        <input
                            className={styles.searchInput}
                            type='search'
                            placeholder={
                                campoBusca.value === 'data_aquisicao' ? "Ex: xx/05/2024 (Use 'xx' para qualquer)" : 
                                "Pesquisar..."
                            }
                            value={buscaInput}
                            onChange={(e) => setBuscaInput(e.target.value)}
                        />
                    )}
                </div>
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(f => (
                                <CardFerramenta key={f.id} ferramenta={f} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhuma ferramenta encontrada.</p>
                )}
                {isFetchingNextPage && <p style={{color: '#888', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default Ferramenta;