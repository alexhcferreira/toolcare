import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Nota: Se você criou o arquivo deposito.module.css, mude o import abaixo para ele.
// Se está reutilizando o de filial propositalmente, mantenha assim.
import styles from '../Filial/filial.module.css'; 
import api from '../../../services/api';
import CardDeposito from '../../../components/Cards/Deposito/CardDeposito';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Deposito = () => {
    const [buscaInput, setBuscaInput] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const queryClient = useQueryClient();

    // Debounce: Espera o usuário parar de digitar por 500ms
    React.useEffect(() => {
        const timer = setTimeout(() => setBuscaDebounced(buscaInput), 500);
        return () => clearTimeout(timer);
    }, [buscaInput]);

    const fetchDepositos = async ({ pageParam = 1 }) => {
        // O parâmetro 'search' é enviado para o Django, que usará os search_fields que configuramos acima
        const response = await api.get(`/api/depositos/`, {
            params: { page: pageParam, search: buscaDebounced }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['depositos', buscaDebounced],
        queryFn: fetchDepositos,
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

    const handleUpdate = () => queryClient.invalidateQueries(['depositos']);

    return (
        <div className={styles.container}>
            <Link to="/deposito_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    // ATUALIZADO: Placeholder mais descritivo
                    placeholder="Pesquisar depósito ou filial..."
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
                            {page.results.map(dep => (
                                <CardDeposito key={dep.id} deposito={dep} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhum depósito encontrado.</p>
                )}
                
                {isFetchingNextPage && <p style={{color: '#888', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default Deposito;