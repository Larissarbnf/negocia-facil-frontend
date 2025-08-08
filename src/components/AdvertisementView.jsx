import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WhatsAppContactButton from '../components/WhatsAppContactButton/WhatsAppContactButton';
import ProductList from '../components/Products/ProductList';
import './AdvertisementView.css';

const AdvertisementView = () => {
    const { id } = useParams();
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carregamento do anúncio
        // Substitua por sua chamada real à API
        const fetchAdvertisement = async () => {
            try {
                // const response = await AdvertisementAPI.getById(id);
                // setAdvertisement(response);
                
                // Dados de exemplo para demonstração
                setAdvertisement({
                    id: id,
                    description: "Vendo produtos de alta qualidade com ótimos preços!",
                    whatsappNumber: "(83) 99988-7766",
                    createdAt: new Date().toISOString(),
                    advertiser: {
                        id: 1,
                        name: "João Silva"
                    },
                    products: [
                        {
                            id: 1,
                            name: "Produto Exemplo 1",
                            price: 99.99,
                            description: "Descrição do produto"
                        },
                        {
                            id: 2,
                            name: "Produto Exemplo 2", 
                            price: 149.99,
                            description: "Descrição do produto 2"
                        }
                    ]
                });
            } catch (error) {
                console.error('Erro ao carregar anúncio:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvertisement();
    }, [id]);

    if (loading) {
        return (
            <div className="advertisement-view loading">
                <p>Carregando anúncio...</p>
            </div>
        );
    }

    if (!advertisement) {
        return (
            <div className="advertisement-view error">
                <p>Anúncio não encontrado.</p>
            </div>
        );
    }

    const datetime = new Date(advertisement.createdAt);

    return (
        <div className="advertisement-view">
            <header className="advertisement-header">
                <div className="advertisement-info">
                    <h1>Anúncio #{advertisement.id}</h1>
                    <div className="advertisement-meta">
                        <span className="advertiser">
                            Por: {advertisement.advertiser?.name || 'Anunciante'}
                        </span>
                        <span className="date">
                            {datetime.toLocaleDateString('pt-BR')} às {datetime.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                {/* Botão principal do WhatsApp */}
                <div className="contact-section">
                    <WhatsAppContactButton 
                        whatsappNumber={advertisement.whatsappNumber}
                        advertisementId={advertisement.id}
                        className="large"
                    />
                </div>
            </header>

            <main className="advertisement-content">
                <section className="description-section">
                    <h2>Descrição</h2>
                    <p>{advertisement.description}</p>
                </section>

                <section className="products-section">
                    <div className="section-header">
                        <h2>Produtos Anunciados ({advertisement.products?.length || 0})</h2>
                        
                        {/* Botão WhatsApp secundário na seção de produtos */}
                        <WhatsAppContactButton 
                            whatsappNumber={advertisement.whatsappNumber}
                            advertisementId={advertisement.id}
                            className="small"
                        />
                    </div>

                    {advertisement.products && advertisement.products.length > 0 ? (
                        <div className="products-grid">
                            {advertisement.products.map(product => (
                                <div key={product.id} className="product-card">
                                    <h3>{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-price">
                                        R$ {product.price?.toFixed(2)}
                                    </div>
                                    
                                    {/* Botão WhatsApp específico por produto */}
                                    <WhatsAppContactButton 
                                        whatsappNumber={advertisement.whatsappNumber}
                                        productName={product.name}
                                        advertisementId={advertisement.id}
                                        className="small"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-products">Nenhum produto anunciado.</p>
                    )}
                </section>
            </main>

            {/* Botão flutuante para fácil acesso */}
            <WhatsAppContactButton 
                whatsappNumber={advertisement.whatsappNumber}
                advertisementId={advertisement.id}
                className="floating"
            />
        </div>
    );
};

export default AdvertisementView;