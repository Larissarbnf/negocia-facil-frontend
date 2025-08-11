import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import AdvertisementCard from '../components/Advertisement/AdvertisementCard';
import { AdvertisementAPI } from '../services/AdvertisementAPI';
import './AdvertisementsListPage.css';

const AdvertisementsListPage = () => {
    const navigate = useNavigate();
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAdvertisements();
    }, []);

    const fetchAdvertisements = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Usando sua API configurada
            const response = await AdvertisementAPI.getAll();
            console.log('📋 Anúncios carregados:', response);
            
            setAdvertisements(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('❌ Erro ao buscar anúncios:', err);
            setError('Erro ao carregar anúncios. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/advertisements/new');
    };

    const handleViewDetails = (advertisementId) => {
        console.log('🔍 Navegando para detalhes do anúncio:', advertisementId);
        navigate(`/AnunciosDetalhes/${advertisementId}`);
    };

    const handleWhatsAppContact = (advertisement) => {
        if (advertisement?.whatsappNumber) {
            const cleanNumber = advertisement.whatsappNumber.replace(/\D/g, '');
            const message = `Olá! Vi seu anúncio e tenho interesse.`;
            const whatsappUrl = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleEdit = (advertisementId) => {
        navigate(`/advertisements/edit/${advertisementId}`);
    };

    const handleDelete = async (advertisementId) => {
        try {
            await AdvertisementAPI.delete(advertisementId);
            // Recarregar a lista após deletar
            fetchAdvertisements();
        } catch (err) {
            alert('Erro ao excluir anúncio');
            console.error('Erro ao excluir:', err);
        }
    };

    const getFilteredAdvertisements = () => {
        switch (filter) {
            case 'with-whatsapp':
                return advertisements.filter(ad => ad.whatsappNumber);
            case 'my-ads':
                const currentUserId = getCurrentUserId();
                return advertisements.filter(ad => ad.advertiser?.id == currentUserId);
            default:
                return advertisements;
        }
    };

    const getCurrentUserId = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                return parsed.id || parsed.userId;
            }
        } catch (e) {
            console.log('Erro ao parsear dados do usuário:', e);
        }
        return localStorage.getItem('userId') || localStorage.getItem('currentUserId');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Data não informada';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Gratuito';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const calculateTotalPrice = (products) => {
        if (!products || !Array.isArray(products)) return 0;
        return products.reduce((sum, product) => sum + (product.price || 0), 0);
    };

    const filteredAds = getFilteredAdvertisements();
    const whatsappAdsCount = advertisements.filter(ad => ad.whatsappNumber).length;

    if (loading) {
        return (
            <div className="advertisements-page-container">
                <Sidebar />
                <div className="advertisements-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando anúncios...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advertisements-page-container">
                <Sidebar />
                <div className="advertisements-content">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>Erro ao carregar anúncios</h3>
                        <p>{error}</p>
                        <button onClick={fetchAdvertisements} className="btn-retry">
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisements-page-container">
            <Sidebar />
            <div className="advertisements-content">
                {/* Header */}
                <div className="page-header">
                    <div className="header-info">
                        <h1>Anúncios</h1>
                        <div className="stats">
                            <span className="stat-item">
                                {advertisements.length} {advertisements.length === 1 ? 'anúncio' : 'anúncios'}
                            </span>
                            <span className="stat-item whatsapp-stat">
                                💬 {whatsappAdsCount} com WhatsApp
                            </span>
                        </div>
                    </div>
                    <button className="btn-create" onClick={handleCreateNew}>
                        + Criar Anúncio
                    </button>
                </div>

                {/* Filtros */}
                <div className="filters-container">
                    <div className="filters">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({advertisements.length})
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'with-whatsapp' ? 'active' : ''}`}
                            onClick={() => setFilter('with-whatsapp')}
                        >
                            Com WhatsApp ({whatsappAdsCount})
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'my-ads' ? 'active' : ''}`}
                            onClick={() => setFilter('my-ads')}
                        >
                            Meus Anúncios
                        </button>
                    </div>
                </div>

                {/* Lista de Anúncios */}
                <div className="advertisements-list">
                    {filteredAds.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📢</div>
                            <h3>Nenhum anúncio encontrado</h3>
                            <p>
                                {filter === 'with-whatsapp' 
                                    ? 'Não há anúncios com WhatsApp no momento.'
                                    : filter === 'my-ads'
                                    ? 'Você ainda não criou nenhum anúncio.'
                                    : 'Não há anúncios disponíveis no momento.'
                                }
                            </p>
                            {filter !== 'all' && (
                                <button 
                                    className="btn-clear-filter"
                                    onClick={() => setFilter('all')}
                                >
                                    Ver todos os anúncios
                                </button>
                            )}
                            <button 
                                className="btn-create-first"
                                onClick={handleCreateNew}
                            >
                                Criar primeiro anúncio
                            </button>
                        </div>
                    ) : (
                        filteredAds.map(advertisement => (
                            <AdvertisementCard
                                key={advertisement.id}
                                advertisement={advertisement}
                                showActions={true}
                                currentUserId={getCurrentUserId()}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onWhatsAppContact={handleWhatsAppContact}
                            />
                        ))
                    )}
                </div>

                {/* Botão flutuante para criar anúncio */}
                <button className="btn-floating-create" onClick={handleCreateNew} title="Criar novo anúncio">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AdvertisementsListPage;