import React, { useState, useEffect } from "react";
import api from "../../services/api";
import CardFerramenta from "../../components/Cards/Ferramenta/CardFerramenta";

const ListaFerramentas = () => {
    const [ferramentas, setFerramentas] = useState([]);

    const loadFerramentas = async () => {
        try {
            const response = await api.get("/api/ferramentas/");
            setFerramentas(response.data);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        }
    };

    useEffect(() => {
        loadFerramentas();
    }, []);

    return (
        <div style={{ padding: "4rem" }}>
            <h1 style={{ color: "white", marginBottom: "2rem" }}>Teste de Cards de Ferramentas</h1>
            
            <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "2rem", 
                justifyContent: "center" 
            }}>
                {ferramentas.map(f => (
                    <CardFerramenta 
                        key={f.id} 
                        ferramenta={f} 
                        onUpdate={loadFerramentas} // Passa a função para recarregar
                    />
                ))}
            </div>
        </div>
    );
};

export default ListaFerramentas;