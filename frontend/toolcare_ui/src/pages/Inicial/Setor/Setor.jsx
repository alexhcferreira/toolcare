import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Reutilizando CSS de grid da filial (pois o layout é igual)
import styles from '../Filial/filial.module.css'; 
import api from '../../../services/api';
import CardSetor from '../../../components/Cards/Setor/CardSetor';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Setor = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const timer = setTimeout(() => setBuscaDebounced(buscaInput), 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchSetores = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/setores/`, {
            params: { page: pageParam, search: buscaDebounced, somente_ativos: 'true' }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['setores', buscaDebounced, 'somente_ativos'],
        queryFn: fetchSetores,
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

    const handleUpdate = () => queryClient.invalidateQueries(['setores']);

    return (
        <div className={styles.container}>
            <Link to="/setor_cadastro" className={styles.addButton}>+</Link>
            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar setor..."
                    value={buscaInput}
                    onChange={(e) => setBuscaInput(e.target.value)}
                />
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: 'white', fontSize: '1.6rem'}} className={styles.emptyMessage}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(setor => (
                                <CardSetor key={setor.id} setor={setor} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}} className={styles.emptyMessage}>Nenhum setor encontrado.</p>
                )}
                
                {isFetchingNextPage && <p style={{color: '#888', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default Setor;