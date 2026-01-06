export const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#353535',
        borderColor: state.isFocused ? '#f46524' : 'transparent',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        boxShadow: state.isFocused ? '0 0 0 1px #f46524' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#f46524' : 'transparent',
        },
        minHeight: '5rem',
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#353535',
        zIndex: 9999,
        border: '1px solid #555'
    }),

    // --- ADICIONE ESTE BLOCO ABAIXO PARA A BARRA DE ROLAGEM ---
    menuList: (base) => ({
        ...base,
        padding: 0,
        
        // Para Firefox
        scrollbarWidth: 'medium',
        scrollbarColor: '#555 #353535',

        // Para Chrome, Edge, Safari
        '::-webkit-scrollbar': {
            width: '8px',
        },
        '::-webkit-scrollbar-track': {
            background: '#353535',
        },
        '::-webkit-scrollbar-thumb': {
            backgroundColor: '#555',
            borderRadius: '10px',
            border: '2px solid #353535', // Cria um efeito de margem interna
        },
        '::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#888',
        }
    }),
    // ----------------------------------------------------------

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#f46524' : '#353535',
        color: 'white',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#d8561a',
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: 'white',
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.6rem',
    }),
    input: (base) => ({
        ...base,
        color: 'white',
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.6rem',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'rgba(255, 255, 255, 0.4)',
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.6rem',
        fontWeight: 300,
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'white',
        '&:hover': { color: 'white' }
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),

     multiValue: (base) => ({
        ...base,
        backgroundColor: '#444',       // Um cinza levemente mais claro que o fundo
        border: '1px solid #6b6b6bff',   // Borda laranja fina para combinar com a identidade
        borderRadius: '0.4rem',        // Cantos arredondados
    }),

    // 2. O texto dentro da tag
    multiValueLabel: (base) => ({
        ...base,
        color: '#ffffff',              // Texto branco
        fontFamily: 'Lato, sans-serif',
        fontSize: '1.4rem',            // Tamanho legível
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
    }),

    // 3. O botão 'X' de remover
    multiValueRemove: (base) => ({
        ...base,
        color: '#f46524',              // X laranja
        cursor: 'pointer',
        borderTopRightRadius: '0.4rem',
        borderBottomRightRadius: '0.4rem',
        ':hover': {
            backgroundColor: '#f46524', // Fundo fica laranja ao passar o mouse
            color: 'white',             // X fica branco
        },
    }),


};
