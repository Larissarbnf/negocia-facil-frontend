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
    const [filter, setFilter] = useState('all'); // all, with-whatsapp, my-ads

    useEffect(() => {
        fetchAdvertisements();
    }, []);

    const fetchAdvertisements = async () => {
        try {
            setLoading(true);
            // Substitua pela sua chamada real à API
            // const response = await AdvertisementAPI.getAll();
            // setAdvertisements(response);
            
            // Dados de exemplo para demonstração
            const mockAds = [
                {
                    id: 1,
                    description: "Vendo diversos produtos eletrônicos em ótimo estado. Todos testados e funcionando perfeitamente.",
                    whatsappNumber: "(83) 99988-7766",
                    createdAt: "2024-01-15T10:30:00Z",
                    advertiser: { id: 1, name: "João Silva" },
                    products: [
                        { id: 1, name: "Smartphone Samsung", price: 899.99 },
                        { id: 2, name: "Fones Bluetooth", price: 199.99 },
                        { id: 3, name: "Carregador Portátil", price: 89.99 }
                    ]
                },
                {
                    id: 2,
                    description: "Anúncio de calculadora",
                    whatsappNumber: null,
                    createdAt: "2024-01-14T21:00:00Z",
                    advertiser: { id: 2, name: "Maria Santos" },
                    products: [
                        { id: 4, name: "Calculadora Científica", price: 45.00 }
                    ]
                },
                {
                    id: 3,
                    description: "Oi! Estou vendendo alguns itens de casa que não uso mais. Tudo em perfeito estado!",
                    whatsappNumber: "(83) 98765-4321",
                    createdAt: "2024-01-13T15:45:00Z",
                    advertiser: { id: 3, name: "Pedro Costa" },
                    products: [
                        { id: 5, name: "Liquidificador", price: 120.00 },
                        { id: 6, name: "Ventilador de Mesa", price: 85.00 }
                    ]
                }
            ];
            
            setAdvertisements(mockAds);
        } catch (err) {
            setError('Erro ao carregar anúncios');
            console.error('Erro ao buscar anúncios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/advertisements/new');
    };

    const getFilteredAdvertisements = () => {
        switch (filter) {
            case 'with-whatsapp':
                return advertisements.filter(ad => ad.whatsappNumber);
            case 'my-ads':
                // Aqui você filtraria pelos anúncios do usuário logado
                const currentUserId = getCurrentUserId();
                return advertisements.filter(ad => ad.advertiser?.id === currentUserId);
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
        return localStorage.getItem('userId') || localStorage.getItem('currentUserId') || 1;
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
                        </div>
                    ) : (
                        filteredAds.map(advertisement => (
                            <AdvertisementCard
                                key={advertisement.id}
                                advertisement={advertisement}
                                showActions={true}
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