import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdvertisementAPI } from "../services/AdvertisementAPI.js";
import SimpleAdvertisementCard from "../components/Advertisement/SimpleAdvertisementCard.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import './CriarAnuncio.css'; 

// Componente Button simples
const Button = ({ text, action, className }) => (
    <button onClick={action} className={className}>
        {text}
    </button>
);

function CriarAnuncio() { // Renomeado para CriarAnuncio
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
            
            console.log('🚀 Carregando anúncios...');
            const data = await AdvertisementAPI.getAll();
            
            console.log('✅ Anúncios carregados:', data);
            setAdvertisements(data);
            
        } catch (error) {
            console.error('❌ Erro ao carregar anúncios:', error);
            setError(error.message);
            setAdvertisements([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o anúncio ${id}? Esta ação não pode ser desfeita.`
        );
        
        if (!confirmDelete) return;

        try {
            console.log(`🗑️ Deletando anúncio ${id}...`);
            await AdvertisementAPI.delete(id);
            
            console.log('✅ Anúncio deletado com sucesso!');
            alert("Anúncio deletado com sucesso!");
            await loadAdvertisements();
            
        } catch (error) {
            console.error('❌ Erro ao deletar anúncio:', error);
            
            if (error.message.includes('404')) {
                alert("Anúncio não encontrado. Talvez já tenha sido deletado.");
            } else {
                alert(`Erro ao deletar anúncio: ${error.message}`);
            }
            
            await loadAdvertisements();
        }
    };

    const handleEdit = (id) => {
        console.log(`✏️ Editando anúncio ${id}`);
        navigate(`/advertisements/edit/${id}`);
    };

    const handleNewAdvertisement = () => {
        console.log('➕ Criando novo anúncio');
        navigate("/advertisements/new");
    };

    const formatCreationTime = (createdAt) => {
        try {
            const date = new Date(createdAt);
            return date.toLocaleDateString("pt-BR") + " às " + 
                   date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "Data inválida";
        }
    };

    // Filtrar e ordenar anúncios
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
            <div className="advertisements-page-container">
                <Sidebar />
                <div className="advertisements-page premium">
                    <div className="loading-container premium">
                        <div className="loading-spinner premium"></div>
                        <div className="loading-text">
                            <h3>Carregando seus anúncios</h3>
                            <p>Aguarde um momento...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisements-page-container">
            <Sidebar />
            <div className="advertisements-page premium">
                {/* Header Premium */}
                <div className="page-header premium">
                    <div className="header-content">
                        <div className="title-section">
                            <h1 className="page-title">
                                <span className="title-icon">📢</span>
                                Meus Anúncios
                                <span className="ads-count">{advertisements.length}</span>
                            </h1>
                            <p className="page-subtitle">Gerencie todos os seus anúncios em um só lugar</p>
                        </div>
                        
                        <div className="header-actions">
                            <Button 
                                text="✨ Novo Anúncio" 
                                action={handleNewAdvertisement}
                                className="btn-primary premium"
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros e Busca Premium */}
                <div className="filters-section premium">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar anúncios por descrição ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input premium"
                            />
                            {searchTerm && (
                                <button 
                                    className="clear-search"
                                    onClick={() => setSearchTerm("")}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="sort-container">
                        <label className="sort-label">Ordenar por:</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select premium"
                        >
                            <option value="recent">Mais recentes</option>
                            <option value="oldest">Mais antigos</option>
                            <option value="items">Mais produtos</option>
                        </select>
                    </div>
                </div>

                {/* Estatísticas Premium */}
                <div className="stats-section premium">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <span className="stat-value">{advertisements.length}</span>
                            <span className="stat-label">Total de Anúncios</span>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {advertisements.reduce((sum, ad) => sum + (ad.products?.length || 0), 0)}
                            </span>
                            <span className="stat-label">Total de Produtos</span>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🕒</div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {advertisements.length > 0 ? 
                                    new Date(Math.max(...advertisements.map(ad => new Date(ad.createdAt)))).toLocaleDateString("pt-BR")
                                    : "N/A"
                                }
                            </span>
                            <span className="stat-label">Último Anúncio</span>
                        </div>
                    </div>
                </div>

                {/* Banner de Erro Premium */}
                {error && (
                    <div className="error-banner premium">
                        <div className="error-content">
                            <span className="error-icon">⚠️</span>
                            <div className="error-text">
                                <h4>Ops! Algo deu errado</h4>
                                <p>{error}</p>
                            </div>
                            <button onClick={loadAdvertisements} className="retry-btn premium">
                                🔄 Tentar Novamente
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Anúncios ou Estado Vazio */}
                {filteredAndSortedAds.length === 0 ? (
                    <div className="empty-state premium">
                        <div className="empty-illustration">
                            <div className="empty-icon">📋</div>
                            <div className="empty-circles">
                                <div className="circle circle-1"></div>
                                <div className="circle circle-2"></div>
                                <div className="circle circle-3"></div>
                            </div>
                        </div>
                        
                        <div className="empty-content">
                            <h3 className="empty-title">
                                {searchTerm ? "Nenhum anúncio encontrado" : "Seus anúncios aparecerão aqui"}
                            </h3>
                            <p className="empty-description">
                                {searchTerm 
                                    ? `Não encontramos anúncios com "${searchTerm}". Tente outro termo.`
                                    : "Comece criando seu primeiro anúncio e alcance mais clientes!"
                                }
                            </p>
                            
                            <div className="empty-actions">
                                {searchTerm ? (
                                    <Button 
                                        text="🔍 Limpar Busca" 
                                        action={() => setSearchTerm("")}
                                        className="btn-secondary premium"
                                    />
                                ) : (
                                    <Button 
                                        text="🚀 Criar Primeiro Anúncio" 
                                        action={handleNewAdvertisement}
                                        className="btn-primary premium large"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="advertisements-grid premium">
                        {filteredAndSortedAds.map((ad, index) => (
                            <div 
                                key={ad.id} 
                                className="ad-card-wrapper"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <SimpleAdvertisementCard 
                                    id={ad.id} 
                                    creationTime={formatCreationTime(ad.createdAt)}
                                    description={ad.description || "Sem descrição"} 
                                    itemsCount={ad.products?.length || 0}
                                    onDelete={() => handleDelete(ad.id)}
                                    onEdit={() => handleEdit(ad.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Resultados da Busca */}
                {searchTerm && filteredAndSortedAds.length > 0 && (
                    <div className="search-results-info">
                        <p>Mostrando {filteredAndSortedAds.length} resultado(s) para "<strong>{searchTerm}</strong>"</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CriarAnuncio;