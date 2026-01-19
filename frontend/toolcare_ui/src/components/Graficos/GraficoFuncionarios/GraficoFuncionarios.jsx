import React from 'react';
import Chart from 'react-apexcharts';

const GraficoFuncionarios = ({ semEmprestimo, comEmprestimo }) => {
    const series = [semEmprestimo, comEmprestimo]; // [Verde, Vermelho]
    
    const options = {
        fill: { colors: ['#0BDD17', '#DD0B0B'] },
        chart: { type: 'donut' },
        stroke: { show: false, width: 0 },
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                startAngle: -90, // Começa do topo (opcional, ajusta onde o corte fica)
                endAngle: 270,
                donut: { size: '65%' },
                expandOnClick: false
            }
        },
        tooltip: { enabled: false }
    };

    return (
        <div style={{ width: '50rem', height: '50rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Chart options={options} series={series} type="donut" width="200%" height="100%" />
        </div>
    );
};

export default GraficoFuncionarios;