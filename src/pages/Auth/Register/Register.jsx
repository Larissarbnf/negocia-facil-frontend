import React, { useState } from "react";
import styles from "./Register.module.css";
import Button from "../../../components/Button/Button.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [enrollmentNumber, setEnrollmentNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const userData = {
            username,
            password,
            fullName,
            enrollmentNumber
        };

        try {
            const response = await axios.post("http://localhost:8080/auth/register", userData);

            if (response.status === 201 || response.status === 200) {
                navigate("/auth/login");
            }
        } catch (err) {
            console.error("Erro ao cadastrar:", err);
            setError("Erro ao criar conta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Criar Conta</h1>
                    <p className={styles.subtitle}>
                        Preencha seus dados para acessar o sistema
                    </p>
                </div>

                {/* Form Card */}
                <div className={styles.card}>
                    <form onSubmit={handleRegister} className={styles.form}>
                        {error && (
                            <div className={styles.errorMessage}>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className={styles.fieldsContainer}>
                            {/* Nome Completo */}
                            <div className={styles.field}>
                                <label htmlFor="fullName" className={styles.label}>
                                    Nome Completo
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Digite seu nome completo"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className={styles.field}>
                                <label htmlFor="username" className={styles.label}>
                                    Email Institucional
                                </label>
                                <input
                                    id="username"
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={styles.input}
                                    placeholder="seu.email@ifpb.edu.br"
                                    required
                                    pattern="^[a-zA-Z0-9._%+-]+@ifpb\.edu\.br$"
                                    title="O email deve terminar com @ifpb.edu.br"
                                />
                            </div>

                            {/* Matrícula */}
                            <div className={styles.field}>
                                <label htmlFor="enrollmentNumber" className={styles.label}>
                                    Matrícula
                                </label>
                                <input
                                    id="enrollmentNumber"
                                    type="text"
                                    value={enrollmentNumber}
                                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                                    className={styles.input}
                                    placeholder="Digite sua matrícula"
                                    required
                                />
                            </div>

                            {/* Senha */}
                            <div className={styles.field}>
                                <label htmlFor="password" className={styles.label}>
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    minLength={8}
                                    maxLength={30}
                                />
                                <span className={styles.hint}>
                                    A senha deve ter no mínimo 8 caracteres
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className={styles.buttonContainer}>
                            <Button 
                                type="submit" 
                                text={isLoading ? "Criando conta..." : "Criar Conta"}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Login Link */}
                        <div className={styles.linkContainer}>
                            <Link to="/auth/login" className={styles.link}>
                                Já tem uma conta? <span className={styles.linkHighlight}>Faça login</span>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Ao criar uma conta, você concorda com nossos termos de uso
                    </p>
                </div>
            </div>
        </div>
    );
}