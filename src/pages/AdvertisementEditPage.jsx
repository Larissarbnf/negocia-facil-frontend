import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdvertisementAPI } from "../services/AdvertisementAPI";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Button from "../components/Button/Button.jsx";
import './AdvertisementEditPage.css';

function AdvertisementEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [advertisement, setAdvertisement] = useState(null);
    const [formData, setFormData] = useState({
        description: "",
        whatsappNumber: "",
        products: [],
        createdAt: null,
        advertiser: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            loadAdvertisement();
        }
    }, [id]);

    async function loadAdvertisement() {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log(`🔍 Carregando anúncio ${id}...`);
            const data = await AdvertisementAPI.getById(id);
            
            console.log('✅ Anúncio carregado:', data);
            setAdvertisement(data);
            setFormData({
                description: data.description || "",
                whatsappNumber: data.whatsappNumber || data.whatsapp || "",
                products: data.products || [],
                createdAt: data.createdAt,
                advertiser: data.advertiser
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar anúncio:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'whatsappNumber') {
            const formatted = formatWhatsApp(value);
            setFormData(prev => ({
                ...prev,
                [name]: formatted
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Função para validar e formatar número de WhatsApp
    const formatWhatsApp = (number) => {
        if (!number) return "";
        
        // Remove tudo que não é número
        const cleanNumber = number.replace(/\D/g, '');
        
        // Aplica a máscara (XX) XXXXX-XXXX
        if (cleanNumber.length <= 11) {
            return cleanNumber.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        return cleanNumber.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const getCurrentUserData = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                return {
                    id: parsed.id || parsed.userId || 1,
                    name: parsed.fullName || parsed.full_name || parsed.name || parsed.username || 'Usuário',
                    email: parsed.email || null,
                    username: parsed.username || parsed.email || null
                };
            }
            
            return {
                id: parseInt(localStorage.getItem('userId') || 1),
                name: localStorage.getItem('userName') || 'Usuário',
                email: null,
                username: null
            };
        } catch (e) {
            console.error('❌ Erro ao obter dados do usuário:', e);
            return { id: 1, name: 'Usuário', email: null, username: null };
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!formData.description.trim()) {
            alert("Por favor, adicione uma descrição para o anúncio.");
            return;
        }

        // Validação do WhatsApp (opcional, mas se preenchido deve estar válido)
        if (formData.whatsappNumber && formData.whatsappNumber.replace(/\D/g, '').length < 10) {
            alert("Número do WhatsApp deve ter pelo menos 10 dígitos!");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            
            console.log(`💾 Salvando anúncio ${id}...`);
            
            const userData = getCurrentUserData();
            
            // Estrutura correta para sua API
            const updatedData = {
                id: parseInt(id),
                description: formData.description.trim(),
                whatsappNumber: formData.whatsappNumber.replace(/\D/g, ''),
                whatsapp: formData.whatsappNumber.replace(/\D/g, ''),
                createdAt: formData.createdAt,
                advertiser: {
                    ...formData.advertiser,
                    id: userData.id,
                    name: userData.name,
                    fullName: userData.name,
                    email: userData.email,
                    username: userData.username
                },
                advertiserId: userData.id,
                products: formData.products || []
            };
            
            console.log('📤 Dados sendo enviados:', updatedData);
            
            await AdvertisementAPI.update(id, updatedData);
            
            console.log('✅ Anúncio atualizado com sucesso!');
            alert("Anúncio atualizado com sucesso!");
            navigate("/advertisements");
            
        } catch (error) {
            console.error('❌ Erro ao atualizar anúncio:', error);
            setError(error.message);
            
            if (error.message.includes('401') || error.message.includes('Token')) {
                alert('Sessão expirada. Faça login novamente.');
                navigate('/auth/login');
            } else {
                alert(`Erro ao salvar: ${error.message}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        const hasChanges = 
            formData.description !== (advertisement?.description || "") ||
            formData.whatsappNumber !== (advertisement?.whatsappNumber || advertisement?.whatsapp || "");
            
        if (hasChanges) {
            const confirmLeave = window.confirm(
                "Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?"
            );
            if (!confirmLeave) {
                return;
            }
        }
        
        navigate("/advertisements");
    };

    const handleAddProduct = () => {
        console.log("🛍️ Adicionar produto ao anúncio");
        alert("Funcionalidade de adicionar produtos será implementada em breve!");
    };

    const handleRemoveProduct = (productIndex) => {
        const confirmRemove = window.confirm("Tem certeza que deseja remover este produto do anúncio?");
        if (confirmRemove) {
            setFormData(prev => ({
                ...prev,
                products: prev.products.filter((_, index) => index !== productIndex)
            }));
        }
    };

    // Função para formatar a data de criação
    const formatCreationTime = (createdAt) => {
        try {
            const date = new Date(createdAt);
            return date.toLocaleDateString("pt-BR") + " às " + 
                   date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "Data inválida";
        }
    };

    if (isLoading) {
        return (
            <div className="advertisement-edit-page-container">
                <Sidebar />
                <div className="advertisement-edit-page">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando anúncio...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !advertisement) {
        return (
            <div className="advertisement-edit-page-container">
                <Sidebar />
                <div className="advertisement-edit-page">
                    <div className="error-container">
                        <h2>❌ Erro ao carregar anúncio</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <Button 
                                text="Tentar novamente" 
                                action={loadAdvertisement}
                                className="btn-secondary"
                            />
                            <Button 
                                text="Voltar para anúncios" 
                                action={() => navigate("/advertisements")}
                                className="btn-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisement-edit-page-container">
            <Sidebar />
            <div className="advertisement-edit-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Editar Anúncio</h1>
                        {advertisement && (
                            <div className="advertisement-info">
                                <span className="advertisement-id">ID: {advertisement.id}</span>
                                <span className="creation-time">
                                    Criado em: {formatCreationTime(advertisement.createdAt)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="header-actions">
                        <Button 
                            text="Cancelar" 
                            action={handleCancel}
                            className="btn-secondary"
                        />
                        <Button 
                            text={isSaving ? "Salvando..." : "Salvar"} 
                            action={handleSave}
                            className="btn-primary"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                {error && (
                    <div className="error-banner">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                <form onSubmit={handleSave} className="edit-form">
                    <div className="form-section">
                        <div className="section-header">
                            <h2>Informações do Anúncio</h2>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Descrição *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Digite uma descrição para o anúncio..."
                                rows={4}
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="whatsappNumber">WhatsApp para contato</label>
                            <input
                                type="text"
                                id="whatsappNumber"
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleInputChange}
                                placeholder="(85) 99999-9999"
                                maxLength={15}
                                disabled={isSaving}
                            />
                            <small className="form-hint">
                                📱 Opcional - Deixe em branco se não quiser receber contatos via WhatsApp
                            </small>
                        </div>

                        <div className="products-info">
                            <div className="products-header">
                                <span className="products-count">
                                    Quantidade de itens no anúncio: 
                                    <span className="count-badge">{formData.products.length}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h2>Produtos</h2>
                            <Button 
                                text="Adicionar produto" 
                                action={handleAddProduct}
                                className="btn-outline"
                                type="button"
                                disabled={isSaving}
                            />
                        </div>

                        {formData.products.length === 0 ? (
                            <div className="empty-products">
                                <p>📦 Nenhum produto adicionado ao anúncio</p>
                                <p>Clique em "Adicionar produto" para começar</p>
                            </div>
                        ) : (
                            <div className="products-list">
                                {formData.products.map((product, index) => (
                                    <div key={index} className="product-item">
                                        <div className="product-info">
                                            <h4>{product.name || `Produto ${index + 1}`}</h4>
                                            <p>{product.description || "Sem descrição"}</p>
                                            {product.price && (
                                                <span className="product-price">
                                                    R$ {product.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="remove-product-btn"
                                            onClick={() => handleRemoveProduct(index)}
                                            disabled={isSaving}
                                            title="Remover produto"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>

                <div className="form-footer">
                    <div className="footer-actions">
                        <Button 
                            text="Cancelar" 
                            action={handleCancel}
                            className="btn-secondary"
                            disabled={isSaving}
                        />
                        <Button 
                            text={isSaving ? "Salvando..." : "Salvar alterações"} 
                            action={handleSave}
                            className="btn-primary"
                            disabled={isSaving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvertisementEditPage;