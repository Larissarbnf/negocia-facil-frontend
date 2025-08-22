import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import { AdvertisementAPI } from '../services/AdvertisementAPI.js';
import './AnunciosDetalhes.css';

const AnunciosDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // 🆕 NOVOS ESTADOS PARA USUÁRIO ATUAL
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // VERIFICAÇÃO MELHORADA: Redirecionar se não há ID
    useEffect(() => {
        if (!id) {
            console.log('⚠️ ID não fornecido na URL, redirecionando para lista de anúncios');
            navigate('/advertisements', { replace: true });
            return;
        }
        
        console.log('🔍 ID encontrado:', id);
        fetchAdvertisementDetails();
    }, [id, navigate]);

    // 🆕 useEffect para buscar dados do usuário atual
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setUserLoading(false);
                    return;
                }

                console.log('🔍 Buscando dados do usuário atual da API...');
                const response = await fetch('http://localhost:8080/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log('✅ Usuário atual da API:', userData);
                    setCurrentUser(userData);
                } else {
                    console.error('❌ Erro ao buscar usuário:', response.status);
                }
            } catch (error) {
                console.error('❌ Erro na requisição do usuário:', error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const fetchAdvertisementDetails = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            setError(null);
            console.log('📡 Buscando anúncio com ID:', id);
            const response = await AdvertisementAPI.getById(id);
            console.log('✅ Anúncio encontrado:', response);
            setAdvertisement(response);
        } catch (err) {
            console.error('❌ Erro ao buscar anúncio:', err);
            
            // Verificar se é erro 404 (anúncio não encontrado)
            if (err.message && err.message.includes('404')) {
                setError('Anúncio não encontrado. Pode ter sido removido ou o ID está incorreto.');
            } else {
                setError('Erro ao carregar detalhes do anúncio. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 🎯 FUNÇÃO CORRIGIDA PARA OBTER NOME DO ANUNCIANTE
    const getAdvertiserName = () => {
        const advertiser = advertisement?.advertiser;
        
        console.log('🏷️ Determinando nome do anunciante...');
        console.log('👤 Objeto advertiser:', advertiser);
        
        if (!advertiser) {
            console.log('⚠️ Dados do anunciante não encontrados');
            return 'Usuário Anônimo';
        }
        
        // Buscar o nome nas propriedades mais comuns
        const name = advertiser.fullName || 
                    advertiser.full_name || 
                    advertiser.name || 
                    advertiser.username || 
                    advertiser.firstName ||
                    (advertiser.firstName && advertiser.lastName ? `${advertiser.firstName} ${advertiser.lastName}` : null) ||
                    (advertiser.id ? `Usuário #${advertiser.id}` : null) ||
                    'Usuário Anônimo';
        
        console.log('✅ Nome determinado:', name);
        return name;
    };

    // 🎯 FUNÇÃO CORRIGIDA PARA OBTER NÚMERO DO WHATSAPP
    const getWhatsAppNumber = () => {
        console.log('📱 Buscando número do WhatsApp...');
        console.log('📄 Dados do anúncio:', advertisement);
        
        const whatsappNumber = advertisement?.whatsappNumber || 
                              advertisement?.whatsapp || 
                              advertisement?.phone ||
                              advertisement?.advertiser?.whatsappNumber || 
                              advertisement?.advertiser?.whatsapp ||
                              advertisement?.advertiser?.phone ||
                              advertisement?.advertiser?.phoneNumber ||
                              advertisement?.advertiser?.celular ||
                              advertisement?.advertiser?.telefone;

        console.log('📱 Número WhatsApp encontrado:', whatsappNumber);
        return whatsappNumber;
    };

    // 🎯 FUNÇÃO PARA VERIFICAR SE TEM WHATSAPP
    const hasWhatsApp = () => {
        const number = getWhatsAppNumber();
        const hasNumber = !!(number && number.toString().replace(/\D/g, '').length >= 10);
        console.log('📱 Tem WhatsApp disponível:', hasNumber, 'Número:', number);
        return hasNumber;
    };

    const handleWhatsAppContact = () => {
        const whatsappNumber = getWhatsAppNumber();

        console.log('📱 Tentando contatar via WhatsApp:', whatsappNumber);

        if (whatsappNumber) {
            const cleanNumber = whatsappNumber.toString().replace(/\D/g, '');
            console.log('📱 Número limpo:', cleanNumber);
            
            if (cleanNumber.length < 10) {
                alert('Número do WhatsApp inválido.');
                return;
            }
            
            const message = `Olá! Vi seu anúncio "${advertisement.title || advertisement.description || 'Anúncio'}" e tenho interesse.`;
            const whatsappUrl = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(message)}`;
            console.log('🔗 URL do WhatsApp:', whatsappUrl);
            window.open(whatsappUrl, '_blank');
        } else {
            console.warn('⚠️ Número do WhatsApp não encontrado');
            alert('Número do WhatsApp não disponível para este anúncio.');
        }
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

    // 🔧 FUNÇÃO CORRIGIDA PARA VERIFICAR SE É DONO (usando API)
    const isOwner = () => {
        if (!currentUser || !advertisement?.advertiser?.id) {
            console.log('❌ Dados insuficientes para verificar propriedade');
            return false;
        }

        const currentUserId = currentUser.id;
        const advertiserId = advertisement.advertiser.id;
        
        console.log('🔍 Verificando propriedade do anúncio...');
        console.log('👤 ID do usuário atual (API):', currentUserId);
        console.log('📝 ID do anunciante:', advertiserId);
        
        const isOwnerResult = currentUserId === advertiserId;
        console.log('🏠 É proprietário?', isOwnerResult);
        
        return isOwnerResult;
    };

    const handleEdit = () => {
        navigate(`/advertisements/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
            try {
                await AdvertisementAPI.delete(id);
                alert('Anúncio excluído com sucesso!');
                navigate('/advertisements');
            } catch (err) {
                alert('Erro ao excluir anúncio');
                console.error('Erro ao excluir:', err);
            }
        }
    };

    const nextImage = () => {
        if (advertisement?.images?.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === advertisement.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (advertisement?.images?.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? advertisement.images.length - 1 : prev - 1
            );
        }
    };

    // Estado de carregamento
    if (loading) {
        return (
            <div className="advertisement-details-container">
                <Sidebar />
                <div className="advertisement-details-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando detalhes...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado de erro
    if (error || !advertisement) {
        return (
            <div className="advertisement-details-container">
                <Sidebar />
                <div className="advertisement-details-content">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>Anúncio não encontrado</h3>
                        <p>{error || 'O anúncio que você está procurando não existe ou foi removido.'}</p>
                        <div className="error-actions">
                            <button onClick={() => navigate('/advertisements')} className="btn-back">
                                Ver todos os anúncios
                            </button>
                            <button onClick={() => fetchAdvertisementDetails()} className="btn-retry">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalValue = advertisement.products?.reduce((sum, product) => sum + (product.price || 0), 0) || 0;

    return (
        <div className="advertisement-details-container">
            <Sidebar />
            <div className="advertisement-details-content">
                {/* Container centralizado */}
                <div className="details-wrapper">
                    
                    {/* Header com botão voltar */}
                    <div className="details-header">
                        <button onClick={() => navigate(-1)} className="btn-back-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                            </svg>
                            Voltar
                        </button>
                        
                        {isOwner() && (
                            <div className="owner-actions">
                                <button onClick={handleEdit} className="btn-edit">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                    Editar
                                </button>
                                <button onClick={handleDelete} className="btn-delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                    Excluir
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Galeria de imagens */}
                    {advertisement.images && advertisement.images.length > 0 && (
                        <div className="image-gallery">
                            <div className="main-image">
                                <img 
                                    src={advertisement.images[currentImageIndex]} 
                                    alt={`Imagem ${currentImageIndex + 1} do anúncio`}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/800x500/f0f0f0/666?text=Sem+Imagem';
                                    }}
                                />
                                {advertisement.images.length > 1 && (
                                    <>
                                        <button className="nav-btn nav-prev" onClick={prevImage}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                                            </svg>
                                        </button>
                                        <button className="nav-btn nav-next" onClick={nextImage}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                                            </svg>
                                        </button>
                                    </>
                                )}
                                <div className="image-counter">
                                    {currentImageIndex + 1} / {advertisement.images.length}
                                </div>
                            </div>
                            {advertisement.images.length > 1 && (
                                <div className="image-thumbnails">
                                    {advertisement.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100x100/f0f0f0/666?text=Sem+Imagem';
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Layout principal em duas colunas */}
                    <div className="details-main">
                        {/* Conteúdo principal */}
                        <div className="details-content">
                            {/* Informações principais */}
                            <div className="main-info">
                                <div className="title-section">
                                    <h1>{advertisement.title || `Anúncio #${advertisement.id}`}</h1>
                                    <div className="status-badge">
                                        <span className={`status ${advertisement.status || 'active'}`}>
                                            {advertisement.status === 'active' ? 'Ativo' : 
                                             advertisement.status === 'sold' ? 'Vendido' : 
                                             advertisement.status === 'inactive' ? 'Inativo' : 'Ativo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="description-section">
                                    <h3>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                        </svg>
                                        Descrição
                                    </h3>
                                    <p>{advertisement.description || 'Sem descrição disponível.'}</p>
                                </div>

                                {/* Localização */}
                                {advertisement.location && (
                                    <div className="location-section">
                                        <h3>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                            Localização
                                        </h3>
                                        <p>
                                            {advertisement.location.neighborhood && `${advertisement.location.neighborhood}, `}
                                            {advertisement.location.city} - {advertisement.location.state}
                                        </p>
                                    </div>
                                )}

                                {/* Data de publicação */}
                                <div className="date-section">
                                    <h3>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                                        </svg>
                                        Publicado em
                                    </h3>
                                    <p>{formatDate(advertisement.createdAt)}</p>
                                    {advertisement.updatedAt && advertisement.updatedAt !== advertisement.createdAt && (
                                        <p className="updated-date">Atualizado em {formatDate(advertisement.updatedAt)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Lista de produtos */}
                            {advertisement.products && advertisement.products.length > 0 && (
                                <div className="products-section">
                                    <h3>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                        Produtos ({advertisement.products.length})
                                    </h3>
                                    <div className="products-grid">
                                        {advertisement.products.map(product => (
                                            <div key={product.id} className="product-card">
                                                <div className="product-info">
                                                    <h4>{product.name}</h4>
                                                    {product.description && (
                                                        <p className="product-description">{product.description}</p>
                                                    )}
                                                    {product.condition && (
                                                        <span className="product-condition">{product.condition}</span>
                                                    )}
                                                </div>
                                                <div className="product-price">
                                                    {formatPrice(product.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="total-section">
                                        <div className="total-value">
                                            <strong>Valor total: {formatPrice(totalValue)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar com informações do anunciante */}
                        <div className="advertiser-sidebar">
                            <div className="advertiser-card">
                                <div className="advertiser-header">
                                    <div className="advertiser-avatar">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                    <div className="advertiser-info">
                                        <h3>{getAdvertiserName()}</h3>
                                        {advertisement.advertiser?.memberSince && (
                                            <p className="member-since">
                                                Membro desde {new Date(advertisement.advertiser.memberSince).getFullYear()}
                                            </p>
                                        )}
                                        {advertisement.advertiser?.rating && (
                                            <div className="rating">
                                                <span className="stars">
                                                    {'★'.repeat(Math.floor(advertisement.advertiser.rating))}
                                                    {'☆'.repeat(5 - Math.floor(advertisement.advertiser.rating))}
                                                </span>
                                                <span className="rating-value">
                                                    {advertisement.advertiser.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {advertisement.advertiser?.totalAds && (
                                    <div className="advertiser-stats">
                                        <div className="stat">
                                            <span className="stat-value">{advertisement.advertiser.totalAds}</span>
                                            <span className="stat-label">anúncios publicados</span>
                                        </div>
                                    </div>
                                )}

                                {/* Botões de contato */}
                                <div className="contact-section">
                                    {hasWhatsApp() ? (
                                        <button onClick={handleWhatsAppContact} className="btn-whatsapp">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                            </svg>
                                            Contatar via WhatsApp
                                        </button>
                                    ) : (
                                        <div className="no-whatsapp-info">
                                            <p>📵 WhatsApp não informado pelo anunciante</p>
                                        </div>
                                    )}

                                    {(advertisement.advertiser?.phone && advertisement.advertiser.phone !== getWhatsAppNumber()) && (
                                        <a href={`tel:${advertisement.advertiser.phone}`} className="btn-phone">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                                            </svg>
                                            Ligar agora
                                        </a>
                                    )}

                                    {advertisement.advertiser?.email && (
                                        <a href={`mailto:${advertisement.advertiser.email}`} className="btn-email">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                            </svg>
                                            Enviar e-mail
                                        </a>
                                    )}
                                </div>

                                <div className="safety-tips">
                                    <h4>🛡️ Dicas de segurança</h4>
                                    <ul>
                                        <li>Prefira encontros em locais públicos</li>
                                        <li>Leve um acompanhante sempre que possível</li>
                                        <li>Confira o produto antes de efetuar o pagamento</li>
                                        <li>Desconfie de preços muito abaixo do mercado</li>
                                        <li>Nunca faça transferências antecipadas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnunciosDetalhes;