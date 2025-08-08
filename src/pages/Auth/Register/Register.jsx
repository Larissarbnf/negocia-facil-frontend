import styles from "./Register.module.css";
import { useState } from "react";
import Button from "../../../components/Button/Button.jsx";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

export default function Register() {

    const navigate = useNavigate()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [enrollmentNumber, setEnrollmentNumber] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

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
        }
    };


    return (
        <div className={styles.container}>
            <form onSubmit={handleRegister} className={styles.form}>
                <h2 className={styles.title}>Bem-vindo! Crie sua conta</h2>

                <input
                    type="email"
                    placeholder="Email institucional"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@ifpb\.edu\.br$"
                    title="O email deve terminar com @ifpb.edu.br"
                />

                <input
                    type="password"
                    placeholder="Senha (mínimo 8 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required
                    minLength={8}
                    maxLength={30}
                />

                <input
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.input}
                    required
                />

                <input
                    type="text"
                    placeholder="Matrícula"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    className={styles.input}
                    required
                />

                <Button type={"submit"} text={"Cadastrar"}/>
                <Link to="/auth/login" className={styles.link}>
                    Já tem uma conta? Voltar para login
                </Link>
            </form>
        </div>
    );
}
