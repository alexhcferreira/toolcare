import React, { useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import styles from './login.module.css';
import logo from '../../assets/imagens/logo.png'; 
import FalhaLoginComponent from '../../components/Avisos/FalhaLogin/falha_login';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [loginFailed, setLoginFailed] = useState(false);
    const { login, authenticated } = useContext(AuthContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginFailed(false);
        const result = await login(cpf, password);
        if (!result.success) {
            setLoginFailed(true);
        }
    };

    if (authenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <img className={styles.logo} src={logo} alt="ToolCare Logo" />
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        className={styles.input} 
                        placeholder="CPF" 
                        value={cpf} 
                        onChange={(e) => setCpf(e.target.value)}
                        required
                    />
                    
                    <input 
                        type="password" 
                        className={styles.input} 
                        placeholder="Senha" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <button type="submit" className={styles.button}>
                        ENTRAR
                    </button>
                </form>

                {loginFailed && <FalhaLoginComponent />}
            </div>
        </div>
    );
};

export default Login;