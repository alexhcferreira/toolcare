// src/utils/reportGenerator.js

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// CORREÇÃO: Verificação de segurança antes de atribuir
if (pdfFonts && pdfFonts.pdfMake) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts) {
    // Em algumas versões, o vfs está direto no pdfFonts
    pdfMake.vfs = pdfFonts.vfs; 
}

const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Função Principal para Ferramenta
export const gerarRelatorioFerramenta = async (ferramenta, historicoEmprestimos, historicoManutencoes) => {
    
    // Define o conteúdo do documento
    const docDefinition = {
        content: [
            // Título
            { text: `Relatório da ferramenta ${ferramenta.nome}`, style: 'header' },
            
            // Dados da Ferramenta
            {
                text: [
                    { text: 'Número de série: ', bold: true }, `${ferramenta.numero_serie}\n`,
                    { text: 'Estado: ', bold: true }, `${ferramenta.estado}\n`,
                    { text: 'Depósito: ', bold: true }, `${ferramenta.deposito_nome || 'N/A'}\n`,
                    { text: 'Data de Aquisição: ', bold: true }, `${formatDate(ferramenta.data_aquisicao)}\n`
                ],
                margin: [0, 0, 0, 20]
            },

            // Seção de Empréstimos
            { text: 'Empréstimos:', style: 'subheader' },
            historicoEmprestimos.length > 0 ? {
                ul: historicoEmprestimos.map(emp => 
                    `Empréstimo ${emp.id}: \n` +
                    `Duração: ${formatDate(emp.data_emprestimo)} até ${formatDate(emp.data_devolucao) || 'Em aberto'}\n` +
                    `Funcionário: ${emp.funcionario_nome} (Matrícula: ${emp.funcionario_matricula})`
                )
            } : { text: 'Nenhum histórico de empréstimo encontrado.', italics: true, color: 'gray' },

            // Seção de Manutenções
            { text: 'Manutenções:', style: 'subheader', margin: [0, 20, 0, 5] },
            historicoManutencoes.length > 0 ? {
                ul: historicoManutencoes.map(man => 
                    `Manutenção ${man.id}\n` +
                    `Tipo de manutenção: ${man.tipo}\n` +
                    `Duração: ${formatDate(man.data_inicio)} até ${formatDate(man.data_fim) || 'Em aberto'}`
                )
            } : { text: 'Nenhum histórico de manutenção encontrado.', italics: true, color: 'gray' }
        ],

        // Estilos
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5]
            }
        }
    };

    // Gera e baixa o PDF
    pdfMake.createPdf(docDefinition).download(`Relatório_${ferramenta.nome.replace(/\s+/g, '_')}.pdf`);
};

export const gerarRelatorioFuncionario = async (funcionario, historicoEmprestimos) => {
    
    const docDefinition = {
        content: [
            { text: `Relatório do funcionário ${funcionario.nome}`, style: 'header' },
            
            // Dados do Funcionário
            {
                text: [
                    { text: 'Matrícula: ', bold: true }, `${funcionario.matricula}\n`,
                    { text: 'CPF: ', bold: true }, `${funcionario.cpf}\n`,
                    { text: 'Status: ', bold: true }, `${funcionario.ativo ? 'Ativo' : 'Inativo'}\n`,
                    { text: 'Setor: ', bold: true }, `${funcionario.setor_nome || 'N/A'}\n`,
                    { text: 'Cargo: ', bold: true }, `${funcionario.cargo_nome || 'N/A'}\n`,
                    { text: 'Filiais: ', bold: true }, `${funcionario.filiais_detalhes.map(f => f.nome).join(', ') || 'Nenhuma'}\n`
                ],
                margin: [0, 0, 0, 20]
            },

            // Histórico de Empréstimos
            { text: 'Empréstimos:', style: 'subheader' },
            historicoEmprestimos.length > 0 ? {
                ul: historicoEmprestimos.map(emp => 
                    `Empréstimo ${emp.id}: \n` +
                    `Duração: ${formatDate(emp.data_emprestimo)} até ${formatDate(emp.data_devolucao) || 'Em aberto'}\n` +
                    `Ferramenta: ${emp.ferramenta_nome} (Serial: ${emp.ferramenta_numero_serie})`
                )
            } : { text: 'Nenhum histórico de empréstimo encontrado.', italics: true, color: 'gray' }
        ],

        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] }
        }
    };

    pdfMake.createPdf(docDefinition).download(`Relatório_${funcionario.nome.replace(/\s+/g, '_')}.pdf`);
};