import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../Ferramenta/ferramenta_inativo.module.css'; // Copie o CSS de funcionario.module.css
import api from '../../../services/api';
import CardUsuario from '../../../components/Cards/Usuario/CardUsuario';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const UsuarioInativo = () => {
    const [busca, setBusca] = useState('');
    const queryClient = useQueryClient();

    const fetchUsuarios = async ({ pageParam = 1 }) => {
        const response = await api.get(`/api/usuarios/`, {
            params: { page: pageParam, search: busca, somente_inativos: 'true' }
        });
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['usuarios', busca, 'somente_inativos'],
        queryFn: fetchUsuarios,
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
        queryClient.invalidateQueries(['usuarios']);
    };

    return (
        <div className={styles.container}>
            <Link to="/usuario_cadastro" className={styles.addButton}>+</Link>

            <div className={styles.searchBarContainer}>
                <input
                    className={styles.searchInput}
                    type='search'
                    placeholder="Pesquisar usuário (Nome, CPF)..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className={`${styles.cardArea} dark-scroll`} onScroll={handleScroll}>
                {isLoading ? (
                    <p style={{color: '#000', fontSize: '1.6rem'}}>Carregando...</p>
                ) : (
                    data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map(u => (
                                <CardUsuario key={u.id} usuario={u} onUpdate={handleUpdate} />
                            ))}
                        </React.Fragment>
                    ))
                )}
                {!isLoading && data?.pages[0].results.length === 0 && (
                    <p style={{color: '#000', fontSize: '1.6rem'}}>Nenhum usuário encontrado.</p>
                )}
                {isFetchingNextPage && <p style={{color: '#000', fontSize: '1.4rem'}}>Carregando...</p>}
            </div>
        </div>
    );
}

export default UsuarioInativo;