import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. IMPORTS DO REACT QUERY
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. CRIA O CLIENTE DE CACHE
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Não recarrega só de trocar de aba no windows
      staleTime: 1000 * 60 * 5, // Os dados ficam "frescos" por 5 minutos (Instantâneo)
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. ENVOLVE O APP COM O PROVIDER */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();