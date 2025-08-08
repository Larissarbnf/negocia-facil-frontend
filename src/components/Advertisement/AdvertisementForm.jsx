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
    const [isLoading, setIsLoading] = useState(false);

    // Garantir que advertisement existe antes de acessar createdAt
    const datetime = advertisement?.createdAt ? new Date(advertisement.createdAt) : new Date();

    useEffect(() => {
        if (advertisement) {
            setProducts(advertisement.products || []);
            setDescription(advertisement.description || "");
        }
    }, [advertisement]);

    async function updateAdvertisement(event) {
        event.preventDefault();

        if (products.length === 0) {
            alert("Adicione pelo menos um produto ao anúncio antes de salvar.");
            return;
        }

        setIsLoading(true);

        try {
            // Para novos anúncios, pegar userId do primeiro produto ou usar um padrão
            const userId = products[0]?.userId || 1;

            const advertisementData = {
                description,
                products,
                advertiser: { id: userId },
                advertiserId: userId, // Para compatibilidade com AdvertisementRequestDTO
                createdAt: advertisement?.createdAt || new Date().toISOString()
            };

            if (isNew) {
                // Aqui foi corrigido para enviar só o objeto e não "new"
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

            {/* Formulário de descrição */}
            <form className="form-description" onSubmit={updateAdvertisement}>
                <div className="form-group">
                    <label htmlFor="description">Descrição:</label>
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