import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './emprestimo.module.css';
import api from '../../../services/api';
import CardEmprestimo from '../../../components/Cards/Emprestimo/CardEmprestimo';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Emprestimo = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            // LÓGICA DE CONVERSÃO DE DATA BR PARA ISO
            // Se o usuário digitou algo parecido com DD/MM/AAAA
            let termo = buscaInput;
            const regexDataBR = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            
            if (regexDataBR.test(termo)) {
                // Inverte para AAAA-MM-DD
                termo = termo.replace(regexDataBR, '$3-$2-$1');
                console.log("Convertendo data para busca:", termo);
            }
            
            setBuscaDebounced(termo);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchEmprestimos = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/emprestimos/`, {
            params: {
                page: pageParam,
                search: buscaDebounced
            }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['emprestimos', buscaDebounced],
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

    const handleUpdate = () => queryClient.invalidateQueries(['emprestimos']);

    return (
        <div className={styles.container}>
            <Link to="/emprestimo_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar (Nome, Data DD/MM/AAAA)..."
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