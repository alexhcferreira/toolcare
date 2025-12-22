import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ferramenta.module.css';
import api from '../../../services/api';
import CardFerramenta from '../../../components/Cards/Ferramenta/CardFerramenta';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Ferramenta = () => {
    // Estado do Input (o que o usuário digita na hora)
    const [buscaInput, setBuscaInput] = useState('');
    // Estado da Query (o que realmente vai para a API com atraso)
    const [buscaDebounced, setBuscaDebounced] = useState('');
    
    const queryClient = useQueryClient();

    // DEBOUNCE: Só atualiza a busca real depois de 500ms que o usuário parou de digitar
    useEffect(() => {
        const timer = setTimeout(() => {
            setBuscaDebounced(buscaInput);
        }, 500);

        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchFerramentas = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/ferramentas/`, {
            params: {
                page: pageParam,
                search: buscaDebounced // Usa o termo com delay
            }
        });
        return response.data; 
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading, 
    } = useInfiniteQuery({
        // A chave agora depende do buscaDebounced. Mudou isso -> React Query busca automático.
        queryKey: ['ferramentas', buscaDebounced], 
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
            <Link to="/ferramenta_cadastro" className={styles.addButton}>
                +
            </Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    // Atualizei o placeholder para refletir os novos poderes de busca
                    placeholder="Pesquisar (Nome, Serial, Depósito, Cidade)..."
                    value={buscaInput}
                    onChange={(e) => setBuscaInput(e.target.value)}
                />
            </div>

            <div 
                className={`${styles.cardArea} dark-scroll`} 
                onScroll={handleScroll}
            >
                {isLoading ? (
                    <p style={{color: 'white', fontSize: '1.6rem'}}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(f => (
                                <CardFerramenta 
                                    key={f.id} 
                                    ferramenta={f} 
                                    onUpdate={handleUpdate} 
                                />
                            ))}
                        </React.Fragment>
                    ))
                )}

                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhuma ferramenta encontrada.</p>
                )}

                {isFetchingNextPage && (
                    <p style={{width: '100%', textAlign: 'center', color: '#888', fontSize: '1.4rem', padding: '2rem'}}>
                        Carregando mais...
                    </p>
                )}
            </div>
        </div>
    );
}

export default Ferramenta;