import { useEffect, useState } from "react";
import axios from "axios";
import EditUserForm from "../../../components/EditUserForm/EditUserForm.jsx";
import styles from "./EditUsersAdminPage.module.css";
import { useParams, useNavigate } from "react-router-dom";

function EditUsersAdminPage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        checkUserPermissions();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchUser();
        }
    }, [currentUser, id]);

    async function checkUserPermissions() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get("http://localhost:8080/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Usuário logado:", response.data);
            setCurrentUser(response.data);
        } catch (err) {
            console.error("Erro ao verificar permissões:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                setError("Erro ao verificar permissões do usuário");
            }
            setLoading(false);
        }
    }

    async function fetchUser() {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            const res = await axios.get(`http://localhost:8080/api/v1/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log("Dados do usuário a ser editado:", res.data);
            setUserData(res.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao buscar usuário:", err);
            
            if (err.response?.status === 403) {
                setError("Você não tem permissão para visualizar este usuário. Apenas administradores podem editar outros usuários ou você pode editar apenas sua própria conta.");
            } else if (err.response?.status === 404) {
                setError("Usuário não encontrado.");
            } else if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            } else {
                setError("Erro ao carregar dados do usuário.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleEditUser(data) {
        const formattedData = {
            username: data.username,
            fullName: data.fullName,
            enrollmentNumber: data.enrollmentNumber,
            whatsappNumber: data.whatsappNumber || null
        };

        // Só incluir senha se foi fornecida
        if (data.password && data.password.trim()) {
            formattedData.password = data.password.trim();
        }

        console.log("=== DEBUG EDIÇÃO ===");
        console.log("ID do usuário sendo editado:", id);
        console.log("Dados formatados:", formattedData);
        console.log("Usuário logado:", currentUser);

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/v1/users/${id}`, formattedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            alert("Usuário editado com sucesso!");
            navigate("/admin/users"); // Redirecionar após sucesso
        } catch (error) {
            console.error("=== ERRO DETALHADO ===");
            console.error("Status:", error.response?.status);
            console.error("Dados do erro:", error.response?.data);
            console.error("Erro completo:", error);

            if (error.response?.status === 403) {
                alert("Você não tem permissão para editar este usuário. Verifique se:\n" +
                      "1. Você é administrador\n" +
                      "2. Ou está editando sua própria conta\n" +
                      "3. Sua sessão não expirou");
            } else if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.message || "Dados inválidos";
                alert(`Erro nos dados: ${errorMsg}`);
            } else if (error.response?.status === 401) {
                alert("Sessão expirada. Faça login novamente.");
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
                alert(`Erro ao editar usuário: ${errorMsg}`);
            }
        }
    }

    function handleCancel() {
        navigate("/admin/users");
    }

    if (loading) {
        return (
            <div className={styles.mainContent}>
                <div className={styles.loading}>
                    <p>Carregando dados do usuário...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.mainContent}>
                <div className={styles.error}>
                    <h3>Erro</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate("/admin/users")} className={styles.backButton}>
                        Voltar para Lista de Usuários
                    </button>
                </div>
            </div>
        );
    }

    // Verificar se o usuário pode editar
    const canEdit = currentUser && (
        currentUser.roles?.includes('ROLE_ADMIN') || 
        currentUser.id === parseInt(id)
    );

    if (!canEdit) {
        return (
            <div className={styles.mainContent}>
                <div className={styles.accessDenied}>
                    <h3>Acesso Negado</h3>
                    <p>Você não tem permissão para editar este usuário.</p>
                    <p>Apenas administradores podem editar outros usuários ou você pode editar apenas sua própria conta.</p>
                    <button onClick={() => navigate("/admin/users")} className={styles.backButton}>
                        Voltar para Lista de Usuários
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.mainContent}>
            <div className={styles.formHeader}>
                <h2>Editar Usuário</h2>
                <p>Editando: {userData?.fullName || 'Carregando...'}</p>
            </div>
            
            {userData ? (
                <EditUserForm 
                    user={userData} 
                    action={handleEditUser}
                    onCancel={handleCancel}
                />
            ) : (
                <div className={styles.loading}>
                    <p>Carregando dados do usuário...</p>
                </div>
            )}
        </div>
    );
}

export default EditUsersAdminPage;