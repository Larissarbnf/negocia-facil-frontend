import styles from "./Login.module.css"
import axios from "axios"
import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import Button from "../../../components/Button/Button.jsx";

export default function Login(){

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("🔐 Fazendo login com:", email);
            
            const response = await axios.post("http://localhost:8080/auth/login", {
                username: email,
                password: password
            });

            console.log("✅ Resposta do login:", response.data);

            // 🎯 CORREÇÃO: Tentar ambos os nomes de campo
            const token = response.data.token || response.data.accessToken;

            if (!token) {
                throw new Error("Token não retornado pela API");
            }

            localStorage.setItem("token", token);
            console.log("💾 Token salvo:", token);

            // 🎯 CORREÇÃO 2: Verificar role do usuário e redirecionar adequadamente
            try {
                const userResponse = await axios.get("http://localhost:8080/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("👤 Dados do usuário:", userResponse.data);
                console.log("🎭 Roles:", userResponse.data.roles);

                const isAdmin = userResponse.data.roles?.includes('ROLE_ADMIN');
                
                if (isAdmin) {
                    console.log("👑 Usuário é admin, redirecionando para admin...");
                    navigate("/admin/users/register"); // Ou a rota admin que existe
                } else {
                    console.log("🧑 Usuário comum, redirecionando para dashboard...");
                    navigate("/admin/users/"); // Ou a rota de usuário comum
                }
                
            } catch (userError) {
                console.error("❌ Erro ao buscar dados do usuário:", userError);
                // Fallback: redirecionar para admin mesmo assim
                navigate("/admin/users/register");
            }

        } catch (err) {
            console.error("❌ Erro ao fazer login:", err);
            console.error("📝 Detalhes:", err.response?.data);
            
            alert(`Erro no login: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleLogin} className={styles.form}>
                <h2 className={styles.title}>Bem-vindo de Volta! Acesse sua conta</h2>
                <input
                    type="email"
                    placeholder="Email institucional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required={true}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required={true}
                    disabled={loading}
                />
                <Button 
                    type={"submit"} 
                    text={loading ? "Entrando..." : "Entrar"}
                    disabled={loading}
                />
                <Link to="/auth/register" className={styles.link}>
                    Ainda não tem uma conta? Cadastre-se aqui
                </Link>
            </form>
        </div>
    )
}