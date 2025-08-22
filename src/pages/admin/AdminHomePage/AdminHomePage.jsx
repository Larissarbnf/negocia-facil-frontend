import { Outlet } from "react-router-dom"; 
import { useState, useEffect } from "react";
import SidebarLayout from "../../../layouts/admin/SidebarLayout/SidebarLayout.jsx";
import EditProfileModal from "./EditProfileModal/EditProfileModal.jsx";
import styles from "./AdminHomePage.module.css";

export default function AdminHomePage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Função para obter dados do usuário logado
    const getCurrentUserData = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                return {
                    id: parsed.id || parsed.userId,
                    name: parsed.fullName || parsed.full_name || parsed.name || parsed.username,
                    email: parsed.email,
                    username: parsed.username,
                    whatsappNumber: parsed.whatsappNumber || parsed.whatsapp,
                    roles: parsed.roles || []
                };
            }
            return null;
        } catch (e) {
            console.error('Erro ao obter dados do usuário:', e);
            return null;
        }
    };

    // Função para buscar dados atualizados da API
    const fetchUserDataFromAPI = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:8080/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const apiUserData = await response.json();
                
                // Atualizar localStorage com dados da API
                localStorage.setItem('user', JSON.stringify(apiUserData));
                
                // Formatear dados para o componente
                const formattedData = {
                    id: apiUserData.id,
                    name: apiUserData.fullName || apiUserData.name || apiUserData.username,
                    email: apiUserData.email,
                    username: apiUserData.username,
                    whatsappNumber: apiUserData.whatsappNumber || apiUserData.whatsapp,
                    roles: apiUserData.roles || []
                };
                
                setUserData(formattedData);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário da API:', error);
            // Em caso de erro, usar dados do localStorage
            const localData = getCurrentUserData();
            setUserData(localData);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            // Primeiro, carregar dados do localStorage (mais rápido)
            const localData = getCurrentUserData();
            setUserData(localData);
            setLoading(false);
            
            // Depois, buscar dados atualizados da API
            await fetchUserDataFromAPI();
        };

        loadUserData();
    }, []);

    // Callback quando o perfil é salvo
    const handleProfileSaved = (updatedUserData) => {
        const formattedData = {
            id: updatedUserData.id,
            name: updatedUserData.fullName || updatedUserData.name || updatedUserData.username,
            email: updatedUserData.email,
            username: updatedUserData.username,
            whatsappNumber: updatedUserData.whatsappNumber || updatedUserData.whatsapp,
            roles: updatedUserData.roles || []
        };
        setUserData(formattedData);
    };

    // Se não há dados do usuário, mostrar aviso
    if (!userData && !loading) {
        return (
            <SidebarLayout>
                <div className={styles.loginWarning}>
                    <h3>⚠️ Dados do usuário não encontrados</h3>
                    <p>Faça login novamente para acessar o sistema.</p>
                    <button 
                        className={styles.loginButton}
                        onClick={() => window.location.href = '/auth/login'}
                    >
                        Fazer Login
                    </button>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className={styles.container}>
                {/* Header com informações do usuário */}
                <div className={styles.userHeader}>
                    {/* Botão de editar perfil */}
                    <button 
                        className={styles.editProfileButton}
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        ✏️ Editar Perfil
                    </button>

                    <div className={styles.userInfo}>
                        {/* Avatar */}
                        <div className={styles.avatar}>
                            {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
                        </div>

                        {/* Informações do usuário */}
                        <div className={styles.userDetails}>
                            <h1 className={styles.welcomeTitle}>
                                Bem-vindo, {userData?.name || 'Usuário'}! 👋
                            </h1>
                            
                            <div className={styles.userMetadata}>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataIcon}>👤</span>
                                    <div className={styles.metadataContent}>
                                        <span className={styles.metadataLabel}>Username</span>
                                        <span className={styles.metadataValue}>{userData?.username || 'Não informado'}</span>
                                    </div>
                                </div>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataIcon}>📱</span>
                                    <div className={styles.metadataContent}>
                                        <span className={styles.metadataLabel}>WhatsApp</span>
                                        <span className={styles.metadataValue}>{
                                            userData?.whatsappNumber 
                                                ? (() => {
                                                    const number = userData.whatsappNumber;
                                                    const cleanNumber = number.replace(/\D/g, '');
                                                    if (cleanNumber.length >= 11) {
                                                        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 7)}-${cleanNumber.slice(7, 11)}`;
                                                    } else if (cleanNumber.length >= 10) {
                                                        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 6)}-${cleanNumber.slice(6, 10)}`;
                                                    }
                                                    return number;
                                                })()
                                                : 'Não informado'
                                        }</span>
                                    </div>
                                </div>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataIcon}>🆔</span>
                                    <div className={styles.metadataContent}>
                                        <span className={styles.metadataLabel}>ID do Usuário</span>
                                        <span className={styles.metadataValue}>#{userData?.id || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges de roles */}
                            {userData?.roles && userData.roles.length > 0 && (
                                <div className={styles.rolesSection}>
                                    <strong>🎭 Permissões:</strong>
                                    <div className={styles.rolesBadges}>
                                        {userData.roles.map(role => (
                                            <span 
                                                key={role}
                                                className={`${styles.roleBadge} ${
                                                    role.includes('ADMIN') ? styles.admin : styles.user
                                                }`}
                                            >
                                                {role.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status online */}
                        <div className={styles.onlineStatus}>
                            <div className={styles.statusDot}></div>
                            <span>Online</span>
                        </div>
                    </div>
                </div>

                {/* Cards de informação */}
                <div className={styles.cardsGrid}>
                    {/* Card de Sessão */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>📊 Informações da Sessão</h3>
                        <div className={styles.cardContent}>
                            <p><strong>Login realizado:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                            <p><strong>Horário:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
                            <p><strong>Navegador:</strong> {navigator.userAgent.split(' ')[0]}</p>
                        </div>
                    </div>

                    {/* Card de WhatsApp */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>📱 WhatsApp</h3>
                        <div className={styles.cardContent}>
                            {userData?.whatsappNumber ? (
                                <>
                                    <p><strong>Status:</strong> <span style={{color: '#28a745'}}>✅ Configurado</span></p>
                                    <p><strong>Número:</strong> {(() => {
                                        const number = userData.whatsappNumber;
                                        const cleanNumber = number.replace(/\D/g, '');
                                        if (cleanNumber.length >= 11) {
                                            return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 7)}-${cleanNumber.slice(7, 11)}`;
                                        } else if (cleanNumber.length >= 10) {
                                            return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 6)}-${cleanNumber.slice(6, 10)}`;
                                        }
                                        return number;
                                    })()}</p>
                                    <p style={{fontSize: '12px', color: '#6c757d'}}>
                                        Outros usuários podem te contatar via WhatsApp nos seus anúncios
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p><strong>Status:</strong> <span style={{color: '#dc3545'}}>❌ Não configurado</span></p>
                                    <p style={{fontSize: '12px', color: '#6c757d'}}>
                                        Configure seu WhatsApp para receber contatos dos seus anúncios
                                    </p>
                                    <button 
                                        className={`${styles.actionButton} ${styles.warning}`}
                                        onClick={() => setIsEditModalOpen(true)}
                                        style={{marginTop: '10px', padding: '8px 12px', fontSize: '12px'}}
                                    >
                                        📱 Adicionar WhatsApp
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Card de Ações Rápidas */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>⚡ Ações Rápidas</h3>
                        <div className={styles.actionsGrid}>
                            <button className={`${styles.actionButton} ${styles.primary}`}>
                                📝 Criar Anúncio
                            </button>
                            <button className={`${styles.actionButton} ${styles.success}`}>
                                📦 Ver Produtos
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.warning}`}
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                ⚙️ Configurações
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal de edição de perfil */}
                <EditProfileModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    userData={userData}
                    onSave={handleProfileSaved}
                />

                {/* Outlet - Aqui é onde as rotas filhas serão renderizadas */}
                <Outlet />
            </div>
        </SidebarLayout>
    );
}