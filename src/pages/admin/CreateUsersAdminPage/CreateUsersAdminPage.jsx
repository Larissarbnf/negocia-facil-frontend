import { useState, useEffect } from 'react';
import styles from './CreateUsersAdminPage.module.css';
import UserForm from "../../../components/UserForm/UserForm.jsx";
import axios from "axios";

function CreateUsersAdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        checkUserRole();
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    async function checkUserRole() {
        try {
            const token = localStorage.getItem("token");
            console.log("=== VERIFICAÇÃO DE PAPEL DO USUÁRIO ===");
            console.log("Token encontrado:", token ? "Sim" : "Não");
            console.log("Token:", token);
            
            if (!token) {
                console.log("Token não encontrado, redirecionando...");
                window.location.href = "/login";
                return;
            }
            
            console.log("Fazendo requisição para verificar papel do usuário...");
            
            const response = await axios.get(
                "http://localhost:8080/auth/me", // 🎯 URL CORRIGIDA (sem /api/v1)
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            console.log("=== RESPOSTA DA API ===");
            console.log("Status:", response.status);
            console.log("Resposta completa:", response);
            console.log("Dados:", response.data);
            console.log("Roles encontrados:", response.data.roles);
            console.log("Tipo dos roles:", typeof response.data.roles);
            console.log("É array?", Array.isArray(response.data.roles));
            
            // 🎯 VERIFICAÇÃO MAIS DETALHADA
            const roles = response.data.roles || [];
            console.log("Roles processados:", roles);
            
            const isAdmin = roles.includes('ROLE_ADMIN');
            console.log("Contém ROLE_ADMIN?", isAdmin);
            console.log("=== FIM VERIFICAÇÃO ===");
            
            setIsAdmin(isAdmin);
        } catch (error) {
            console.error("=== ERRO AO VERIFICAR PAPEL ===");
            console.error("Erro completo:", error);
            console.error("Status do erro:", error.response?.status);
            console.error("Dados do erro:", error.response?.data);
            console.error("Headers da resposta:", error.response?.headers);
            
            // Se erro 401, redirecionar para login
            if (error.response?.status === 401) {
                console.log("Erro 401 - Token inválido, limpando e redirecionando...");
                localStorage.removeItem("token");
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchUsers() {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/v1/users",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    }

    async function handleCreateUser(data) {
        try {
            await axios.post(
                "http://localhost:8080/api/v1/users",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            alert("Usuário criado com sucesso!");
            setShowForm(false);
            if (isAdmin) {
                fetchUsers(); // Recarrega a lista
            }
        } catch (error) {
            console.error("Erro ao criar usuário:", error.response?.data || error.message || error);
            alert("Ocorreu um erro ao criar o usuário. Verifique o console para mais detalhes.");
        }
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:8080/api/v1/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            alert("Usuário excluído com sucesso!");
            fetchUsers();
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro ao excluir usuário.");
        }
    }

    if (loading) {
        return (
            <div className={styles.mainContent}>
                <div className={styles.loading}>Carregando...</div>
            </div>
        );
    }

    return (
        <div className={styles.mainContent}>
            <div className={styles.header}>
                <h1>Gerenciamento de Usuários</h1>
                {isAdmin && (
                    <button 
                        className={styles.addButton}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancelar' : 'Novo Usuário'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Cadastrar Novo Usuário</h2>
                    </div>
                    <UserForm action={handleCreateUser} />
                </div>
            )}

            {isAdmin && (
                <div className={styles.usersContainer}>
                    <h2>Usuários Cadastrados</h2>
                    {users.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        <div className={styles.usersGrid}>
                            {users.map(user => (
                                <div key={user.id} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <h3>{user.name}</h3>
                                        <p className={styles.userEmail}>{user.email}</p>
                                        <span className={`${styles.userRole} ${styles[user.role?.toLowerCase()]}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className={styles.userActions}>
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => {/* Implementar edição */}}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isAdmin && (
                <div className={styles.accessDenied}>
                    <h2>Acesso Restrito</h2>
                    <p>Você não tem permissão para visualizar esta página.</p>
                </div>
            )}
        </div>
    );
}

export default CreateUsersAdminPage;