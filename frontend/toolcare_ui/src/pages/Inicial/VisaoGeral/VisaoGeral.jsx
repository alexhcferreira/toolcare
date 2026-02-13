import React, { useState, useEffect } from 'react';
import styles from './visao_geral.module.css';
import api from '../../../services/api';
import GraficoFuncionarios from '../../../components/Graficos/GraficoFuncionarios/GraficoFuncionarios';
import GraficoFerramentas from '../../../components/Graficos/GraficoFerramentas/GraficoFerramentas';

import Select from 'react-select';
import { filterSelectStyles } from '../../../components/CustomSelect/filterSelectStyles'; // Reusando estilo limpo

const VisaoGeral = () => {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filtro de Filial
    const [filialSelecionada, setFilialSelecionada] = useState(null);
    const [listaFiliais, setListaFiliais] = useState([]);

    // 1. Carrega Filiais para o Select
    useEffect(() => {
        const loadFiliais = async () => {
            try {
                const response = await api.get('/api/filiais/');
                const dados = response.data.results || response.data;
                const formatados = dados.map(f => ({ value: f.id, label: f.nome }));
                // Opção "Todas"
                formatados.unshift({ value: '', label: 'Visão Global (Todas)' });
                setListaFiliais(formatados);
            } catch (error) {
                console.error("Erro ao carregar filiais", error);
            }
        };
        loadFiliais();
    }, []);

    // 2. Carrega Dashboard (Reage à mudança de filial)
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filialSelecionada && filialSelecionada.value) {
                    params.filial = filialSelecionada.value;
                }

                const response = await api.get('/api/dashboard/', { params });
                setDados(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
                setLoading(false);
            }
        };
        loadDashboard();
    }, [filialSelecionada]);

    const calcPct = (val, total) => total === 0 ? 0 : ((val / total) * 100).toFixed(0);

    return (
        <div className={styles.container}>
            
            {/* --- SELETOR DE FILIAL NO TOPO --- */}
            <div className={styles.filterBar}>
                <div style={{ width: '250px' }}>
                    <Select
                        options={listaFiliais}
                        value={filialSelecionada}
                        onChange={setFilialSelecionada}
                        placeholder="Visão Global (Todas)"
                        styles={filterSelectStyles}
                        isSearchable={false} 
                    />
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Carregando indicadores...</div>
            ) : !dados ? (
                <div className={styles.loading}>Erro ao carregar dados.</div>
            ) : (
                <>
                    {/* ÁREA SUPERIOR: GRÁFICOS */}
                    <div className={styles.chartsRow}>
                        {/* GRÁFICO FUNCIONÁRIOS */}
                        <div className={styles.chartWrapper}>
                            <GraficoFuncionarios 
                                semEmprestimo={dados.funcionarios.sem_emprestimo} 
                                comEmprestimo={dados.funcionarios.com_emprestimo} 
                            />
                            <div className={styles.chartCenterText}>
                                <span className={styles.bigNumber}>{dados.total_funcionarios}</span>
                                <span className={styles.smallText}>funcionários<br/>ativos</span>
                            </div>
                        </div>

                        {/* GRÁFICO FERRAMENTAS */}
                        <div className={styles.chartWrapper}>
                            <GraficoFerramentas 
                                disponiveis={dados.ferramentas.disponiveis}
                                emprestadas={dados.ferramentas.emprestadas}
                                manutencao={dados.ferramentas.manutencao}
                            />
                            <div className={styles.chartCenterText}>
                                <span className={styles.bigNumber}>{dados.total_ferramentas}</span>
                                <span className={styles.smallText}>ferramentas<br/>ativas</span>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA INFERIOR: LEGENDAS E ESTATÍSTICAS */}
                    <div className={styles.statsRow}>
                        
                        {/* COLUNA FUNCIONÁRIOS */}
                        <div className={styles.statsColumn}>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.greenBar}`}></div>
                                <span className={styles.percent}>{calcPct(dados.funcionarios.sem_emprestimo, dados.total_funcionarios)}%</span>
                                <span className={styles.desc}>dos funcionários não têm<br/>nenhum empréstimo</span>
                            </div>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.greenBar}`}></div>
                                <span className={styles.count}>{dados.funcionarios.sem_emprestimo}</span>
                                <span className={styles.desc}>funcionários não têm<br/>nenhum empréstimo</span>
                            </div>

                            <div className={styles.statItem} style={{marginTop: '2rem'}}>
                                <div className={`${styles.bar} ${styles.redBar}`}></div>
                                <span className={styles.percent}>{calcPct(dados.funcionarios.com_emprestimo, dados.total_funcionarios)}%</span>
                                <span className={styles.desc}>dos funcionários têm ao<br/>menos um empréstimo</span>
                            </div>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.redBar}`}></div>
                                <span className={styles.count}>{dados.funcionarios.com_emprestimo}</span>
                                <span className={styles.desc}>funcionários têm ao<br/>menos um empréstimo</span>
                            </div>
                        </div>

                        {/* COLUNA FERRAMENTAS */}
                        <div className={styles.statsColumn}>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.greenBar}`}></div>
                                <span className={styles.percent}>{calcPct(dados.ferramentas.disponiveis, dados.total_ferramentas)}%</span>
                                <span className={styles.desc}>das ferramentas<br/>estão disponíveis</span>
                            </div>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.greenBar}`}></div>
                                <span className={styles.count}>{dados.ferramentas.disponiveis}</span>
                                <span className={styles.desc}>ferramentas<br/>estão disponíveis</span>
                            </div>

                            <div className={styles.statItem} style={{marginTop: '2rem'}}>
                                <div className={`${styles.bar} ${styles.redBar}`}></div>
                                <span className={styles.percent}>{calcPct(dados.ferramentas.emprestadas, dados.total_ferramentas)}%</span>
                                <span className={styles.desc}>das ferramentas<br/>estão emprestadas</span>
                            </div>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.redBar}`}></div>
                                <span className={styles.count}>{dados.ferramentas.emprestadas}</span>
                                <span className={styles.desc}>ferramentas estão<br/>emprestadas</span>
                            </div>

                            <div className={styles.statItem} style={{marginTop: '2rem'}}>
                                <div className={`${styles.bar} ${styles.orangeBar}`}></div>
                                <span className={styles.percent}>{calcPct(dados.ferramentas.manutencao, dados.total_ferramentas)}%</span>
                                <span className={styles.desc}>das ferramentas<br/>estão em manutenção</span>
                            </div>
                            <div className={styles.statItem}>
                                <div className={`${styles.bar} ${styles.orangeBar}`}></div>
                                <span className={styles.count}>{dados.ferramentas.manutencao}</span>
                                <span className={styles.desc}>ferramentas<br/>em manutenção</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VisaoGeral;