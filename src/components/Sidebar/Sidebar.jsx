import {Home, Package, Tag, Shield, LogOut, Users, User} from "lucide-react"; 
import SidebarHeader from "./SidebarHeader/SidebarHeader.jsx"; 
import styles from './Sidebar.module.css'
import {NavLink, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";

function Sidebar(){
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({
        fullName: "Carregando...",
        imgUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=default"
    });

    // 🔄 Carregar dados do usuário
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            // 1️⃣ PRIMEIRA TENTATIVA: Dados do localStorage
            const userDataFromStorage = localStorage.getItem("user");
            if (userDataFromStorage) {
                const userData = JSON.parse(userDataFromStorage);
                console.log("👤 Dados do usuário do localStorage:", userData);
                
                setCurrentUser({
                    fullName: userData.fullName || userData.full_name || userData.name || "Usuário",
                    imgUrl: userData.imgUrl || userData.img_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userData.fullName || 'user'}`
                });
                return; // Se encontrou no localStorage, não precisa fazer requisição
            }

            // 2️⃣ SEGUNDA TENTATIVA: Buscar dados via API
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("❌ Sem token, redirecionando para login");
                navigate("/auth/login");
                return;
            }

            console.log("🔍 Buscando dados do usuário via API...");
            const response = await fetch("http://localhost:8080/auth/me", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log("✅ Dados do usuário da API:", userData);
                
                // Salvar no localStorage para próximas vezes
                localStorage.setItem("user", JSON.stringify(userData));
                
                setCurrentUser({
                    fullName: userData.fullName || userData.full_name || userData.name || "Usuário",
                    imgUrl: userData.imgUrl || userData.img_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userData.fullName || 'user'}`
                });
            } else {
                console.error("❌ Erro ao buscar dados do usuário:", response.status);
                if (response.status === 401 || response.status === 403) {
                    // Token inválido, redirecionar para login
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/auth/login");
                }
            }
        } catch (error) {
            console.error("❌ Erro ao carregar dados do usuário:", error);
            // Em caso de erro, manter nome padrão
            setCurrentUser({
                fullName: "Usuário",
                imgUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=default"
            });
        }
    };

    const handleLogout = () => {
        console.log("🚪 Fazendo logout...");
        
        // Limpar dados do localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirecionar para login
        navigate("/auth/login");
    };

 const menuItems = [
    { icon: <Home size={20} />, label: "Início", path: "/AnunciosDetalhes" },
    { icon: <Package size={20} />, label: "Produtos", path: "/products" },
    { icon: <Tag size={20} />, label: "Anúncios", path: "/CriarAnuncio" },
    { icon: <Shield size={20} />, label: "Regras", path: "/rules" },
    { icon: <Users size={20} />, label: "Usuários", path: "/admin/users" }
];

    return (
        <aside className={styles.aside}>
            <SidebarHeader 
                imgUrl={currentUser.imgUrl} 
                userName={currentUser.fullName}
            />
            <nav className={styles.nav}>
                {
                    menuItems.map((item, index) => (
                        <NavLink className={styles.link} key={index} to={item.path}>
                            <span className={styles.svgImage}>{item.icon}</span>
                            <span className={styles.text}>{item.label}</span>
                        </NavLink>
                    ))
                }
            </nav>
            
            {/* ✅ Logout com função personalizada em vez de NavLink */}
            <button 
                className={styles.link} 
                onClick={handleLogout}
                style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer'
                }}
            >
                <LogOut className={styles.svgImage} size={20}/> 
                <span className={styles.text}>Sair</span>
            </button>
        </aside>
    )
} 

export default Sidebar