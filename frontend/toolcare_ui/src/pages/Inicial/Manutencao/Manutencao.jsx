import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './manutencao.module.css'; // Copie de emprestimo.module.css
import api from '../../../services/api';
import CardManutencao from '../../../components/Cards/Manutencao/ManutencaoCard';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Manutencao = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            // Conversão de data BR para ISO na busca
            let termo = buscaInput;
            const regexDataBR = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (regexDataBR.test(termo)) {
                termo = termo.replace(regexDataBR, '$3-$2-$1');
            }
            setBuscaDebounced(termo);
        }, 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchManutencoes = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/manutencoes/`, {
            params: { page: pageParam, search: buscaDebounced }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['manutencoes', buscaDebounced],
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

    const handleUpdate = () => queryClient.invalidateQueries(['manutencoes']);

    return (
        <div className={styles.container}>
            <Link to="/manutencao_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar (Ferramenta, Serial, Tipo, Data)..."
                    value={buscaInput}
                    onChange={(e) => setBuscaInput(e.target.value)}
                />
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: 'white', fontSize: '1.6rem'}}>Carregando...</p>
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

export default Manutencao;