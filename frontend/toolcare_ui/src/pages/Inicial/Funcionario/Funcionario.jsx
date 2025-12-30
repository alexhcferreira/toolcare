import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './funcionario.module.css'; // Pode copiar o CSS de ferramenta.module.css
import api from '../../../services/api';
import CardFuncionario from '../../../components/Cards/Funcionario/CardFuncionario';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const Funcionario = () => {
    const [busca, setBusca] = useState('');
    const queryClient = useQueryClient();

    const fetchFuncionarios = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/funcionarios/`, {
            params: {
                page: pageParam,
                search: busca
            }
        });
        return response.data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['funcionarios', busca],
        queryFn: fetchFuncionarios,
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
        queryClient.invalidateQueries(['funcionarios']);
    };

    return (
        <div className={styles.container}>
            <Link to="/funcionario_cadastro" className={styles.addButton}>
                +
            </Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar funcionário (Nome, CPF, Matrícula)..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
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
                            {page.results.map(func => (
                                <CardFuncionario 
                                    key={func.id} 
                                    funcionario={func} 
                                    onUpdate={handleUpdate} 
                                />
                            ))}
                        </React.Fragment>
                    ))
                )}

                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#888', fontSize: '1.6rem'}}>Nenhum funcionário encontrado.</p>
                )}

                {isFetchingNextPage && (
                    <p style={{width: '100%', textAlign: 'center', color: '#888', fontSize: '1.4rem', padding: '2rem'}}>
                        Buscando funcionários...
                    </p>
                )}
            </div>
        </div>
    );
}

export default Funcionario;