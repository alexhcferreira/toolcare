// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredToken = localStorage.getItem("@ToolCare:token");

    if (recoveredToken) {
      try {
        const decoded = jwtDecode(recoveredToken);
        
        setUser(decoded); 
        api.defaults.headers.Authorization = `Bearer ${recoveredToken}`;
      } catch (error) {
        localStorage.clear();
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (cpf, password) => {
    try {
      const response = await api.post("/api/token/", {
        cpf,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem("@ToolCare:token", access);
      localStorage.setItem("@ToolCare:refresh_token", refresh);

      const decodedUser = jwtDecode(access);

      setUser(decodedUser);
      api.defaults.headers.Authorization = `Bearer ${access}`;
      
      return { success: true };

    } catch (error) {
      console.error("Erro no login:", error);
      return { 
        success: false, 
        message: error.response?.data?.detail || "Erro ao conectar com o servidor." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("@ToolCare:token");
    localStorage.removeItem("@ToolCare:refresh_token");
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};