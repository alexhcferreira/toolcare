import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './filial_inativo.module.css'; // Crie copiando de funcionario.module.css
import api from '../../../services/api';
import CardFilial from '../../../components/Cards/Filial/CardFilial';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const FilialInativo = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const timer = setTimeout(() => setBuscaDebounced(buscaInput), 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchFiliais = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/filiais/`, {
            params: { 
                page: pageParam, 
                search: buscaDebounced,
                somente_inativos: 'true' // <--- FILTRO ADICIONADO
            }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['filiais', buscaDebounced, 'somente_inativos'],
        queryFn: fetchFiliais,
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

    const handleUpdate = () => queryClient.invalidateQueries(['filiais']);

    return (
        <div className={styles.container}>
            <Link to="/filial_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar filial..."
                    value={buscaInput}
                    onChange={(e) => setBuscaInput(e.target.value)}
                />
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: '#000', fontSize: '1.6rem'}} className={styles.emptyMessage}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(filial => (
                                <CardFilial key={filial.id} filial={filial} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#000', fontSize: '1.6rem'}} className={styles.emptyMessage}>Nenhuma filial encontrada.</p>
                )}
                
                {isFetchingNextPage && <p style={{color: '#000000ff', fontSize: '1.4rem'}} className={styles.emptyMessage}>Carregando...</p>}
            </div>
        </div>
    );
}

export default FilialInativo;