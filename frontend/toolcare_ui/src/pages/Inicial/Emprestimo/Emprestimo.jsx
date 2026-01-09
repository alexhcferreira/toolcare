import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../Ferramenta/ferramenta.module.css'; // Copie de ferramenta.module.css
import api from '../../../services/api';
import CardEmprestimo from '../../../components/Cards/Emprestimo/CardEmprestimo';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import Select from 'react-select';
import { filterSelectStyles } from '../../../components/CustomSelect/filterSelectStyles';

const Emprestimo = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    
    // Filtros
    const [filialSelecionada, setFilialSelecionada] = useState(null); 
    const [campoBusca, setCampoBusca] = useState({ value: 'global', label: 'Todos os campos' });

    const [listaFiliais, setListaFiliais] = useState([]);
    const queryClient = useQueryClient();

    // Campos disponíveis para filtro específico
    const opcoesCampos = [
        { value: 'global', label: 'Todos os campos' },
        { value: 'nome', label: 'Nome do Empréstimo' },
        { value: 'ferramenta', label: 'Nome da Ferramenta' },
        { value: 'serial', label: 'Nº de Série da Ferramenta' },
        { value: 'funcionario', label: 'Nome do Funcionário' },
        { value: 'matricula', label: 'Matrícula do Funcionário' },
        { value: 'data_emprestimo', label: 'Data de Início' },
        { value: 'data_devolucao', label: 'Data de Devolução' },
        { value: 'observacoes', label: 'Observações' }
    ];

    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                const dados = response.data.results || response.data;
                const formatados = dados.map(f => ({ value: f.id, label: f.nome }));
                formatados.unshift({ value: '', label: 'Todas as Filiais' });
                setListaFiliais(formatados);
            } catch (error) {
                console.error("Erro ao carregar filiais", error);
            }
        };
        loadFiliais();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setBuscaDebounced(buscaInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchEmprestimos = async ({ pageParam = 1 }) => {
        const params = { 
            page: pageParam,
            ativo: 'true' // <--- FILTRA SOMENTE ATIVOS
        };

        if (filialSelecionada && filialSelecionada.value) {
            params.filial = filialSelecionada.value;
        }

        if (buscaDebounced) {
            if (campoBusca.value === 'global') {
                params.search = buscaDebounced;
            } else {
                params.search_field = campoBusca.value;
                params.search_value = buscaDebounced;
            }
        }

        const response = await api.get(`/api/emprestimos/`, { params });
        return response.data; 
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading, 
    } = useInfiniteQuery({
        queryKey: ['emprestimos', buscaDebounced, filialSelecionada, campoBusca], 
        queryFn: fetchEmprestimos,
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
        queryClient.invalidateQueries(['emprestimos']);
    };

    return (
        <div className={styles.container}>
            <Link to="/emprestimo_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                
                {/* 1. FILIAL */}
                <div style={{ width: '220px' }}>
                    <Select
                        options={listaFiliais}
                        value={filialSelecionada}
                        onChange={setFilialSelecionada}
                        placeholder="Todas as Filiais"
                        styles={filterSelectStyles}
                        isSearchable={false} 
                    />
                </div>

                <div className={styles.divider}></div>

                {/* 2. CATEGORIA */}
                <div style={{ width: '220px' }}>
                    <Select
                        options={opcoesCampos}
                        value={campoBusca}
                        onChange={(opt) => {
                            setCampoBusca(opt);
                            setBuscaInput(''); 
                        }}
                        styles={filterSelectStyles}
                        isSearchable={false}
                    />
                </div>

                <div className={styles.divider}></div>

                {/* 3. INPUT TEXTO */}
                <div style={{ flex: 1 }}>
                    <input
                        className={styles.searchInput}
                        type='search'
                        placeholder={
                            campoBusca.value === 'data_devolucao' ? "xx/xx/xxxx ou 'Sem'..." :
                            campoBusca.value.includes('data') ? "xx/xx/xxxx..." : 
                            `Filtrar por ${campoBusca.label}...`
                        }
                        value={buscaInput}
                        onChange={(e) => setBuscaInput(e.target.value)}
                    />
                </div>
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(emp => (
                                <CardEmprestimo key={emp.id} emprestimo={emp} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhum empréstimo encontrado.</p>
                )}
                {isFetchingNextPage && <p style={{color: '#888', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default Emprestimo;