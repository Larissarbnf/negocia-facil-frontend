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

    // Garantir que advertisement existe antes de acessar createdAt
    const datetime = advertisement?.createdAt ? new Date(advertisement.createdAt) : new Date();

    useEffect(() => {
        if (advertisement) {
            setProducts(advertisement.products || []);
            setDescription(advertisement.description || "");
            setWhatsappNumber(advertisement.whatsappNumber || advertisement.whatsapp || "");
        }
    }, [advertisement]);

    // Função para obter dados completos do usuário atual - COM DEBUG
    const getCurrentUserData = () => {
        try {
            // 🎯 DEBUG - Verificar TUDO no localStorage
            console.log('=== DEBUG LOCALSTORAGE ===');
            console.log('localStorage completo:', localStorage);
            
            // Verificar todas as chaves possíveis
            const allKeys = Object.keys(localStorage);
            console.log('🔍 Todas as chaves no localStorage:', allKeys);
            
            allKeys.forEach(key => {
                console.log(`🔑 ${key}:`, localStorage.getItem(key));
            });
            
            const userData = localStorage.getItem('user');
            console.log('🔍 userData raw:', userData);
            
            if (userData) {
                const parsed = JSON.parse(userData);
                console.log('🔍 userData parsed:', parsed);
                console.log('🔍 parsed.id:', parsed.id);
                console.log('🔍 parsed.userId:', parsed.userId);
                console.log('🔍 typeof parsed.id:', typeof parsed.id);
                console.log('🔍 typeof parsed.userId:', typeof parsed.userId);
                
                const finalId = parsed.id || parsed.userId || 1;
                console.log('🔍 finalId calculado:', finalId, typeof finalId);
                
                const result = {
                    id: finalId,
                    name: parsed.fullName || parsed.full_name || parsed.name || parsed.username || 'Usuário',
                    email: parsed.email || null,
                    username: parsed.username || parsed.email || null
                };
                
                console.log('🔍 Resultado final getCurrentUserData:', result);
                return result;
            }
            
            // Fallback para dados diretos no localStorage
            console.log('🔍 Tentando fallback...');
            const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId') || 1;
            const userName = localStorage.getItem('userName') || localStorage.getItem('fullName') || 'Usuário';
            
            console.log('🔍 userId do fallback:', userId);
            console.log('🔍 userName do fallback:', userName);
            
            const fallbackResult = {
                id: parseInt(userId),
                name: userName,
                email: null,
                username: null
            };
            
            console.log('🔍 Resultado fallback:', fallbackResult);
            return fallbackResult;
        } catch (e) {
            console.error('❌ Erro ao obter dados do usuário:', e);
            return {
                id: 1,
                name: 'Usuário',
                email: null,
                username: null
            };
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

        // Validação do WhatsApp (opcional, mas se preenchido deve estar válido)
        if (whatsappNumber && whatsappNumber.replace(/\D/g, '').length < 10) {
            alert("Número do WhatsApp deve ter pelo menos 10 dígitos!");
            return;
        }

        setIsLoading(true);

        try {
            const userData = getCurrentUserData();
            console.log('👤 Dados do usuário atual (FINAL):', userData);

            const advertisementData = {
                description: description.trim(),
                products,
                whatsappNumber: whatsappNumber.replace(/\D/g, ''), // Salva apenas números
                whatsapp: whatsappNumber.replace(/\D/g, ''), // Para compatibilidade
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

            console.log('📤 Dados que serão enviados (FINAL):', advertisementData);
            console.log('📤 advertisementData.advertiser.id:', advertisementData.advertiser.id);
            console.log('📤 advertisementData.advertiserId:', advertisementData.advertiserId);

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

    // Loading state
    if (!advertisement && !isNew) {
        return (
            <div className="advertisement-form">
                <div className="loading-spinner">
                    <p>Carregando anúncio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisement-form">
            {/* DEBUG - Mostrar dados do usuário na tela */}
            <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', border: '1px solid #ccc' }}>
                <h4>🐛 DEBUG - Dados do Usuário Atual:</h4>
                <pre>{JSON.stringify(getCurrentUserData(), null, 2)}</pre>
            </div>

            {/* Informações do anúncio existente */}
            {!isNew && advertisement && (
                <div className="advertisement-info">
                    <div className="info-group">
                        <div className="info-item">
                            <strong>ID:</strong> {advertisement.id}
                        </div>
                        <div className="info-item">
                            <strong>Data:</strong> {datetime.toLocaleDateString("pt-BR")}
                        </div>
                        <div className="info-item">
                            <strong>Horário:</strong> {datetime.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Contador de produtos */}
            <div className="products-counter">
                <p>Quantidade de itens no anúncio: <span className="count-badge">{products.length}</span></p>
            </div>

            {/* Formulário de descrição e contato */}
            <form className="form-description" onSubmit={updateAdvertisement}>
                <div className="form-group">
                    <label htmlFor="description">Descrição *:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Digite uma descrição para o anúncio..."
                        rows={4}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="whatsapp">WhatsApp para contato:</label>
                    <input
                        type="text"
                        id="whatsapp"
                        name="whatsapp"
                        value={whatsappNumber}
                        onChange={handleWhatsAppChange}
                        placeholder="(85) 99999-9999"
                        maxLength={15}
                    />
                    <small className="form-hint">
                        📱 Opcional - Deixe em branco se não quiser receber contatos via WhatsApp
                    </small>
                </div>

                <Button
                    type="submit"
                    text={isLoading ? "Salvando..." : "Salvar"}
                    disabled={isLoading}
                />
            </form>

            {/* Lista de produtos selecionados */}
            {products.length > 0 ? (
                <div className="selected-products-section">
                    <h3>Produtos anunciados</h3>
                    <ProductList
                        products={products}
                        onDelete={removeProduct}
                        showMenuOptions={false}
                        showTrashButton={true}
                        showCheckBox={false}
                    />
                </div>
            ) : (
                <div className="no-products-message">
                    <p>Nenhum produto anunciado.</p>
                </div>
            )}

            {/* Seleção de produtos */}
            <div className="product-selection-section">
                <ProductSelection
                    selectedProducts={products}
                    onSelect={setProducts}
                />
            </div>

            {/* Botão cancelar */}
            <div className="form-actions">
                <Button
                    type="button"
                    text="Cancelar"
                    action={() => navigate("/advertisements")}
                    className="btn-secondary"
                />
            </div>
        </div>
    );
}