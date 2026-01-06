
export const filterSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        cursor: 'pointer',
        minHeight: '3rem',
        minWidth: '150px'
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'white',
        zIndex: 9999,
        border: '1px solid #eee',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        borderRadius: '1rem',
        overflow: 'hidden',
        marginTop: '1rem'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#f46524' : 'white', // Laranja no hover
        color: state.isFocused ? 'white' : '#333', // Texto branco no hover, preto normal
        padding: '10px 20px', // Espacinho na esquerda/direita
        cursor: 'pointer',
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.4rem',
        transition: 'all 0.2s',
        ':active': {
            backgroundColor: '#d8561a',
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: '#444',
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.5rem',
        fontWeight: '700',
    }),
    placeholder: (base) => ({
        ...base,
        color: '#444', // Mesma cor do texto (antes era #999)
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.5rem',
        fontWeight: '700', // Mesmo peso da fonte (antes era 300)
    }),
    
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? '#f46524' : '#666',
        transition: 'color 0.2s',
        ':hover': { color: '#f46524' }
    }),
    // Estilo para as tags de Multi-Select (Estado)
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#fcebe6', // Laranja bem claro
        borderRadius: '0.4rem',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#f46524',
        fontWeight: 'bold',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#f46524',
        ':hover': {
            backgroundColor: '#f46524',
            color: 'white',
        },
    }),
};