import { useState, useEffect } from 'react';
import styles from './CreateUsersAdminPage.module.css';
import UserForm from "../../../components/UserForm/UserForm.jsx";
import axios from "axios";

function CreateUsersAdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        checkUserRole();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    async function checkUserRole() {
    console.log('🔍 === DEBUG VERIFICAÇÃO DE ROLE ===');
    
    try {
        const token = localStorage.getItem("token");
        console.log('🔑 Token existe:', !!token);
        
        if (!token) {
            console.log('❌ Nenhum token encontrado');
            window.location.href = "/login";
            return;
        }

        // Decodificar token para ver o que tem dentro
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('📋 Payload do token:', {
                userId: payload.userId || payload.id || payload.sub,
                username: payload.username || payload.sub,
                roles: payload.roles || payload.authorities,
                exp: new Date(payload.exp * 1000),
                isExpired: payload.exp * 1000 < Date.now()
            });
        } catch (e) {
            console.error('❌ Erro ao decodificar token:', e);
        }
        
        console.log('📡 Fazendo requisição para /auth/me...');
        const response = await axios.get(
            "http://localhost:8080/auth/me",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Resposta de /auth/me:', response.data);
        console.log('🎭 Roles do usuário:', response.data.roles);
        
        const roles = response.data.roles || [];
        const isAdminRole = roles.includes('ROLE_ADMIN');
        
        console.log('🔐 Verificação de admin:', {
            roles: roles,
            hasAdminRole: isAdminRole,
            isAdmin: isAdminRole
        });
        
        setIsAdmin(isAdminRole);
        
        if (!isAdminRole) {
            console.log('⚠️ Usuário NÃO é admin!');
        } else {
            console.log('✅ Usuário É admin!');
        }
        
    } catch (error) {
        console.error('❌ === ERRO NA VERIFICAÇÃO ===');
        console.error('Status:', error.response?.status);
        console.error('Mensagem:', error.response?.data);
        console.error('Erro completo:', error);
        
        if (error.response?.status === 401) {
            console.log('🔒 Token expirado ou inválido');
            localStorage.removeItem("token");
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = "/login";
        }
    } finally {
        setLoading(false);
        console.log('🏁 === FIM DEBUG VERIFICAÇÃO ===');
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
            
            const usersData = response.data.content || [];
            setUsers(usersData);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            if (error.response?.status === 403) {
                alert("Você não tem permissão para listar usuários.");
            }
            setUsers([]);
        }
    }

   // 2. SEGUNDO - Melhore a função handleCreateUser com debug
async function handleCreateUser(data) {
    console.log('👤 === DEBUG CRIAR USUÁRIO ===');
    console.log('📝 Dados recebidos:', data);
    
    try {
        const token = localStorage.getItem("token");
        console.log('🔑 Token existe:', !!token);
        
        if (!token) {
            alert("Token não encontrado. Faça login novamente.");
            return;
        }

        // Verificar se ainda é admin antes de criar
        const meResponse = await axios.get("http://localhost:8080/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('👤 Dados do usuário logado:', meResponse.data);
        console.log('🎭 Roles atuais:', meResponse.data.roles);
        
        const isStillAdmin = meResponse.data.roles?.includes('ROLE_ADMIN');
        console.log('🔐 Ainda é admin?', isStillAdmin);
        
        if (!isStillAdmin) {
            alert("Você não tem mais permissões de administrador.");
            return;
        }

        console.log('📡 Enviando requisição POST para criar usuário...');
        console.log('🌐 URL:', "http://localhost:8080/api/v1/users");
        console.log('📋 Headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
        console.log('📦 Body:', JSON.stringify(data, null, 2));

        const response = await axios.post(
            "http://localhost:8080/api/v1/users",
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Usuário criado com sucesso:', response.data);
        alert("Usuário criado com sucesso!");
        handleCancelEdit();
        fetchUsers();
        
    } catch (error) {
        console.error('❌ === ERRO AO CRIAR USUÁRIO ===');
        console.error('Status:', error.response?.status);
        console.error('Mensagem do servidor:', error.response?.data);
        console.error('Headers da resposta:', error.response?.headers);
        console.error('Erro completo:', error);
        
        // Tratamento detalhado de erros
        if (error.response?.status === 403) {
            const errorMsg = error.response?.data?.message || 'Acesso negado';
            console.error('🚫 Erro 403 - Detalhes:', errorMsg);
            alert(`Erro de permissão: ${errorMsg}\n\nVerifique se você tem privilégios de administrador.`);
        } else if (error.response?.status === 401) {
            console.error('🔒 Token inválido');
            alert("Sessão expirada. Faça login novamente.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        } else if (error.response?.status === 400) {
            const errorMsg = error.response?.data?.message || 'Dados inválidos';
            console.error('📝 Erro nos dados:', errorMsg);
            alert(`Erro nos dados: ${errorMsg}`);
        } else {
            const errorMsg = error.response?.data?.message || error.message;
            alert(`Erro ao criar usuário: ${errorMsg}`);
        }
        console.error('🏁 === FIM ERRO CRIAR ===');
    }
}

    async function handleUpdateUser(data) {
        try {
            console.log("=== DEBUG ATUALIZAÇÃO ===");
            console.log("ID do usuário sendo editado:", editingUser.id);
            console.log("Dados sendo enviados:", data);
            
            // Verificar dados do usuário logado
            const token = localStorage.getItem("token");
            const meResponse = await axios.get("http://localhost:8080/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Usuário logado:", meResponse.data);
            console.log("ID do usuário logado:", meResponse.data.id);
            console.log("Roles do usuário logado:", meResponse.data.roles);
            
            // Preparar dados para atualização
            const updateData = { ...data };
            
            // Se a senha estiver vazia, removê-la do payload
            if (!updateData.password || updateData.password.trim() === '') {
                delete updateData.password;
            }
            
            const response = await axios.put(
                `http://localhost:8080/api/v1/users/${editingUser.id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log("Resposta da atualização:", response.data);
            alert("Usuário atualizado com sucesso!");
            handleCancelEdit();
            fetchUsers();
        } catch (error) {
            console.error("=== ERRO DETALHADO ===");
            console.error("Status:", error.response?.status);
            console.error("Mensagem:", error.response?.data?.message);
            console.error("Erro completo:", error.response?.data);
            console.error("Headers da resposta:", error.response?.headers);
            
            // Melhor tratamento de erros
            if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.message || "Dados inválidos";
                alert(`Erro nos dados: ${errorMsg}`);
            } else if (error.response?.status === 403) {
                alert("Erro de permissão. Verifique se você tem privilégios de administrador e se o token não expirou.");
            } else if (error.response?.status === 404) {
                alert("Usuário não encontrado.");
            } else if (error.response?.status === 401) {
                alert("Sessão expirada. Faça login novamente.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else if (error.response?.status === 500) {
                const errorMsg = error.response?.data?.message || "Erro interno do servidor";
                alert(`Erro do servidor: ${errorMsg}`);
            } else {
                const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
                alert(`Erro ao atualizar usuário: ${errorMsg}`);
            }
        }
    }

    function handleEditUser(user) {
        console.log("Editando usuário:", user); // Para debug
        setEditingUser(user);
        setIsEditing(true);
        setShowForm(true);
    }

    function handleNewUser() {
        setEditingUser(null);
        setIsEditing(false);
        setShowForm(true);
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
            
            if (error.response?.status === 403) {
                alert("Você não tem permissão para excluir este usuário.");
            } else if (error.response?.status === 404) {
                alert("Usuário não encontrado.");
            } else if (error.response?.status === 401) {
                alert("Sessão expirada. Faça login novamente.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                alert(`Erro ao excluir usuário: ${error.response?.data?.message || error.message}`);
            }
        }
    }

    function handleCancelEdit() {
        setEditingUser(null);
        setIsEditing(false);
        setShowForm(false);
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
                        onClick={() => {
                            if (showForm) {
                                handleCancelEdit();
                            } else {
                                handleNewUser();
                            }
                        }}
                    >
                        {showForm ? 'Cancelar' : 'Novo Usuário'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>{isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h2>
                    </div>
                    <UserForm 
                        key={isEditing ? `edit-${editingUser?.id}` : 'new'}
                        action={isEditing ? handleUpdateUser : handleCreateUser}
                        initialData={isEditing ? editingUser : null}
                        onCancel={handleCancelEdit}
                        isEditing={isEditing}
                    />
                </div>
            )}

            {isAdmin && (
                <div className={styles.usersContainer}>
                    <h2>Usuários Cadastrados</h2>
                    {!Array.isArray(users) || users.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        <div className={styles.usersGrid}>
                            {users.map((user, index) => (
                                <div key={user.id || index} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <h3>{user.fullName || 'Nome não disponível'}</h3>
                                        <p className={styles.userEmail}>@{user.username || 'Username não disponível'}</p>
                                        <p className={styles.userEnrollment}>
                                            Matrícula: {user.enrollmentNumber || 'Não informado'}
                                        </p>
                                        {user.whatsappNumber && (
                                            <p className={styles.userWhatsapp}>
                                                WhatsApp: {user.whatsappNumber}
                                            </p>
                                        )}
                                        <div className={styles.userRoles}>
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role, index) => (
                                                    <span key={index} className={`${styles.userRole} ${styles[role?.toLowerCase()]}`}>
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.userRole}>Sem role</span>
                                            )}
                                        </div>
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