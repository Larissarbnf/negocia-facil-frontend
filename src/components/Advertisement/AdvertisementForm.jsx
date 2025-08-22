import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import ProductList from "../Products/ProductList.jsx";
import { ProductSelection } from "./ProductSelection.jsx";
import "./AdvertisementForm.css";

export default function AdvertisementForm({ advertisement, onUpdate, isNew }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [description, setDescription] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const datetime = advertisement?.createdAt ? new Date(advertisement.createdAt) : new Date();

    useEffect(() => {
        if (advertisement) {
            setProducts(advertisement.products || []);
            setDescription(advertisement.description || "");
            setWhatsappNumber(advertisement.whatsappNumber || advertisement.whatsapp || "");
        }
    }, [advertisement]);

    const getCurrentUserData = () => {
        try {
            const userData = localStorage.getItem('user');
            
            if (userData) {
                const parsed = JSON.parse(userData);
                const finalId = parsed.id || parsed.userId || 1;
                
                return {
                    id: finalId,
                    name: parsed.fullName || parsed.full_name || parsed.name || parsed.username || 'Usuário',
                    email: parsed.email || null,
                    username: parsed.username || parsed.email || null
                };
            }
            
            const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId') || 1;
            const userName = localStorage.getItem('userName') || localStorage.getItem('fullName') || 'Usuário';
            
            return {
                id: parseInt(userId),
                name: userName,
                email: null,
                username: null
            };
        } catch (e) {
            console.error('Erro ao obter dados do usuário:', e);
            return {
                id: 1,
                name: 'Usuário',
                email: null,
                username: null
            };
        }
    };

    const formatWhatsApp = (number) => {
        if (!number) return "";
        
        const cleanNumber = number.replace(/\D/g, '');
        
        if (cleanNumber.length <= 11) {
            return cleanNumber.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        return cleanNumber.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleWhatsAppChange = (e) => {
        const formatted = formatWhatsApp(e.target.value);
        setWhatsappNumber(formatted);
    };

    async function updateAdvertisement(event) {
        event.preventDefault();

        if (products.length === 0) {
            alert("Adicione pelo menos um produto ao anúncio antes de salvar.");
            return;
        }

        if (!description.trim()) {
            alert("A descrição do anúncio é obrigatória!");
            return;
        }

        if (whatsappNumber && whatsappNumber.replace(/\D/g, '').length < 10) {
            alert("Número do WhatsApp deve ter pelo menos 10 dígitos!");
            return;
        }

        setIsLoading(true);

        try {
            const userData = getCurrentUserData();

            const advertisementData = {
                description: description.trim(),
                products,
                whatsappNumber: whatsappNumber.replace(/\D/g, ''),
                whatsapp: whatsappNumber.replace(/\D/g, ''),
                advertiser: { 
                    id: userData.id,
                    name: userData.name,
                    fullName: userData.name,
                    email: userData.email,
                    username: userData.username
                },
                advertiserId: userData.id,
                createdAt: advertisement?.createdAt || new Date().toISOString()
            };

            if (isNew) {
                await onUpdate(advertisementData);
            } else {
                advertisementData.id = advertisement.id;
                await onUpdate(advertisementData);
            }

            navigate("/advertisements");
        } catch (error) {
            console.error("Erro ao salvar anúncio:", error);
            alert("Erro ao salvar o anúncio. Verifique o console para mais detalhes.");
        } finally {
            setIsLoading(false);
        }
    }

    const removeProduct = (productId) => {
        setProducts(products.filter(product => product.id !== productId));
    };

    if (!advertisement && !isNew) {
        return (
            <div className="advertisement-form">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Carregando anúncio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisement-form">
            <div className="form-header">
                <h1 className="form-title">
                    {isNew ? "✨ Criar Novo Anúncio" : "📝 Editar Anúncio"}
                </h1>
                <p className="form-subtitle">
                    {isNew 
                        ? "Crie um anúncio atrativo para seus produtos" 
                        : "Modifique os detalhes do seu anúncio"
                    }
                </p>
            </div>

            {!isNew && advertisement && (
                <div className="advertisement-info">
                    <div className="info-header">
                        <h3>📋 Informações do Anúncio</h3>
                    </div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">🆔</div>
                            <div className="info-content">
                                <span className="info-label">ID</span>
                                <span className="info-value">{advertisement.id}</span>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">📅</div>
                            <div className="info-content">
                                <span className="info-label">Data</span>
                                <span className="info-value">{datetime.toLocaleDateString("pt-BR")}</span>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🕐</div>
                            <div className="info-content">
                                <span className="info-label">Horário</span>
                                <span className="info-value">{datetime.toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-number">{products.length}</span>
                        <span className="stat-label">
                            {products.length === 1 ? "Produto" : "Produtos"} no anúncio
                        </span>
                    </div>
                </div>
            </div>

            <form className="form-main" onSubmit={updateAdvertisement}>
                <div className="form-section">
                    <h3 className="section-title">
                        <span className="section-icon">📝</span>
                        Detalhes do Anúncio
                    </h3>
                    
                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Descrição do Anúncio <span className="required">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva seus produtos de forma atrativa para os clientes..."
                            className="form-textarea"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="whatsapp" className="form-label">
                            <span className="whatsapp-icon">💬</span>
                            WhatsApp para Contato
                        </label>
                        <input
                            type="text"
                            id="whatsapp"
                            name="whatsapp"
                            value={whatsappNumber}
                            onChange={handleWhatsAppChange}
                            placeholder="(85) 99999-9999"
                            className="form-input"
                            maxLength={15}
                        />
                        <div className="form-hint">
                            <span className="hint-icon">💡</span>
                            Opcional - Os clientes poderão entrar em contato via WhatsApp
                        </div>
                    </div>

                    <div className="form-actions-main">
                        <Button
                            type="submit"
                            text={
                                isLoading ? (
                                    <>
                                        <span className="loading-dots">⟳</span>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        {isNew ? "Criar Anúncio" : "Salvar Alterações"}
                                    </>
                                )
                            }
                            disabled={isLoading}
                            className="btn-primary"
                        />
                    </div>
                </div>
            </form>

            {products.length > 0 ? (
                <div className="products-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🛍️</span>
                            Produtos Selecionados
                        </h3>
                        <div className="products-badge">{products.length}</div>
                    </div>
                    <div className="products-container">
                        <ProductList
                            products={products}
                            onDelete={removeProduct}
                            showMenuOptions={false}
                            showTrashButton={true}
                            showCheckBox={false}
                        />
                    </div>
                </div>
            ) : (
                <div className="empty-products">
                    <div className="empty-icon">📦</div>
                    <h3>Nenhum produto selecionado</h3>
                    <p>Adicione produtos ao seu anúncio usando a seção abaixo</p>
                </div>
            )}

            <div className="selection-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <span className="section-icon">➕</span>
                        Adicionar Produtos
                    </h3>
                </div>
                <div className="selection-container">
                    <ProductSelection
                        selectedProducts={products}
                        onSelect={setProducts}
                    />
                </div>
            </div>

            <div className="form-footer">
                <Button
                    type="button"
                    text={
                        <>
                            <span>❌</span>
                            Cancelar
                        </>
                    }
                    action={() => navigate("/advertisements")}
                    className="btn-secondary"
                />
            </div>
        </div>
    );
}