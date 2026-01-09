import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../Ferramenta/ferramenta_inativo.module.css'; // Copie de emprestimo.module.css
import api from '../../../services/api';
import CardManutencao from '../../../components/Cards/Manutencao/ManutencaoCard';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import Select from 'react-select';
import { filterSelectStyles } from '../../../components/CustomSelect/filterSelectStyles';

const ManutencaoInativo = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    
    // Filtros
    const [filialSelecionada, setFilialSelecionada] = useState(null); 
    const [campoBusca, setCampoBusca] = useState({ value: 'global', label: 'Todos os campos' });

    const [listaFiliais, setListaFiliais] = useState([]);
    const queryClient = useQueryClient();

    // Campos disponíveis para filtro
    const opcoesCampos = [
        { value: 'global', label: 'Todos os campos' },
        { value: 'nome', label: 'Nome' },
        { value: 'ferramenta', label: 'Nome da Ferramenta' },
        { value: 'serial', label: 'Nº de Série da Ferramenta' },
        { value: 'tipo', label: 'Tipo da Manutenção' },
        { value: 'data_inicio', label: 'Data de Início' },
        { value: 'data_fim', label: 'Data de Fim' },
        { value: 'observacoes', label: 'Observações' }
    ];

    // Opções para o Select de Tipo
    const opcoesTipo = [
        { value: 'PREVENTIVA', label: 'Preventiva' },
        { value: 'CORRETIVA', label: 'Corretiva' }
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

    const fetchManutencoes = async ({ pageParam = 1 }) => {
        const params = { 
            page: pageParam,
            ativo: 'false' // <--- FILTRA SOMENTE INATIVAS
        };

        if (filialSelecionada && filialSelecionada.value) {
            params.filial = filialSelecionada.value;
        }

        if (buscaDebounced) {
            if (campoBusca.value === 'global') {
                params.search = buscaDebounced;
            } else if (campoBusca.value === 'tipo') {
                // Se for tipo, manda o valor direto
                params.search_field = 'tipo';
                params.search_value = buscaDebounced;
            } else {
                params.search_field = campoBusca.value;
                params.search_value = buscaDebounced;
            }
        }

        const response = await api.get(`/api/manutencoes/`, { params });
        return response.data; 
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading, 
    } = useInfiniteQuery({
        queryKey: ['manutencoes', buscaDebounced, filialSelecionada, campoBusca], 
        queryFn: fetchManutencoes,
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
        queryClient.invalidateQueries(['manutencoes']);
    };

    return (
        <div className={styles.container}>
            <Link to="/manutencao_cadastro" className={styles.addButton}>+</Link>

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
                <div style={{ width: '200px' }}>
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

                {/* 3. INPUT (CONDICIONAL PARA TIPO) */}
                <div style={{ flex: 1 }}>
                    {campoBusca.value === 'tipo' ? (
                        <Select
                            options={opcoesTipo}
                            onChange={(opt) => setBuscaInput(opt ? opt.value : '')}
                            placeholder="Selecione o tipo..."
                            styles={filterSelectStyles}
                            isSearchable={false}
                        />
                    ) : (
                        <input
                            className={styles.searchInput}
                            type='search'
                            placeholder={
                                campoBusca.value.includes('data') ? "Ex: xx/05/2024..." : 
                                `Filtrar por ${campoBusca.label}...`
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
                            {page.results.map(man => (
                                <CardManutencao key={man.id} manutencao={man} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhuma manutenção encontrada.</p>
                )}
                {isFetchingNextPage && <p style={{color: '#888', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default ManutencaoInativo;