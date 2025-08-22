import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdvertisementAPI } from "../services/AdvertisementAPI";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import './AdvertisementsPage.css';

function AdvertisementsPage() {
    const navigate = useNavigate();
    
    const [advertisements, setAdvertisements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    useEffect(() => {
        loadAdvertisements();
    }, []);

    async function loadAdvertisements() {
        try {
            setIsLoading(true);
            setError(null);
            
            const data = await AdvertisementAPI.getAll();
            setAdvertisements(data);
            
        } catch (error) {
            console.error('Erro ao carregar anúncios:', error);
            setError(error.message);
            setAdvertisements([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCardClick = (id) => {
        navigate(`/advertisements/${id}`);
    };

    const formatCreationTime = (createdAt) => {
        try {
            const date = new Date(createdAt);
            return date.toLocaleDateString("pt-BR", {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return "Data inválida";
        }
    };

    const filteredAndSortedAds = advertisements
        .filter(ad => 
            ad.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.id.toString().includes(searchTerm)
        )
        .sort((a, b) => {
            switch(sortBy) {
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'items':
                    return (b.products?.length || 0) - (a.products?.length || 0);
                default:
                    return 0;
            }
        });

    if (isLoading) {
        return (
            <div className="ads-page-container">
                <Sidebar />
                <div className="ads-page-content">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <h3>Carregando anúncios...</h3>
                        <p>Aguarde um momento</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ads-page-container">
            <Sidebar />
            <div className="ads-page-content">
                {/* Header */}
                <div className="page-header">
                    <div className="header-info">
                        <h1>
                            <span className="header-icon">🛍️</span>
                            Anúncios
                        </h1>
                        <p>Descubra produtos incríveis</p>
                    </div>
                    <div className="header-stats">
                        <span className="stat-badge">
                            {advertisements.length} anúncios
                        </span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <div className="search-input-container">
                            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar anúncios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button 
                                    className="clear-btn"
                                    onClick={() => setSearchTerm("")}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="recent">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                        <option value="items">Mais produtos</option>
                    </select>
                </div>

                {/* Error State */}
                {error && (
                    <div className="error-banner">
                        <div className="error-content">
                            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4>Erro ao carregar anúncios</h4>
                                <p>{error}</p>
                            </div>
                            <button onClick={loadAdvertisements} className="retry-btn">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}

                {/* Advertisements Grid */}
                {filteredAndSortedAds.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>
                            {searchTerm ? "Nenhum anúncio encontrado" : "Nenhum anúncio disponível"}
                        </h3>
                        <p>
                            {searchTerm 
                                ? `Não encontramos anúncios com "${searchTerm}"`
                                : "Não há anúncios disponíveis no momento"
                            }
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="clear-search-btn"
                            >
                                Limpar busca
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="ads-grid">
                            {filteredAndSortedAds.map((ad) => (
                                <div 
                                    key={ad.id} 
                                    className="ad-card"
                                    onClick={() => handleCardClick(ad.id)}
                                >
                                    <div className="ad-card-header">
                                        <div className="ad-id">#{ad.id}</div>
                                        <div className="ad-date">{formatCreationTime(ad.createdAt)}</div>
                                    </div>
                                    
                                    <div className="ad-card-body">
                                        <h3 className="ad-description">
                                            {ad.description || "Sem descrição"}
                                        </h3>
                                        <div className="ad-meta">
                                            <span className="products-count">
                                                <svg viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 110 2h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4zM9 3v1h2V3H9zm0 5a1 1 0 012 0v6a1 1 0 11-2 0V8z"/>
                                                </svg>
                                                {ad.products?.length || 0} produtos
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="ad-card-footer">
                                        <span className="view-details">
                                            Ver detalhes
                                            <svg viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {searchTerm && (
                            <div className="search-results">
                                {filteredAndSortedAds.length} resultado(s) para "<strong>{searchTerm}</strong>"
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdvertisementsPage;