import { useState, useEffect } from "react";
import { ProductAPI } from "../../services/ProductAPI"; // Ajuste o caminho conforme necessário
import Button from "../Button/Button";
import "./ProductSelection.css";

export function ProductSelection({ selectedProducts = [], onSelect }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        loadProducts();
        // Inicializar produtos temporariamente selecionados
        setTempSelectedProducts([...selectedProducts]);
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            setError(null);
            
            const data = await ProductAPI.getAll();
            setProducts(Array.isArray(data) ? data : []);
            
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            setError(error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    // Filtrar produtos baseado na busca e categoria
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === "all" || 
                              product.category?.toLowerCase() === categoryFilter.toLowerCase();
        
        return matchesSearch && matchesCategory;
    });

    // Alternar seleção de um produto
    const toggleProductSelection = (product) => {
        const isSelected = tempSelectedProducts.some(p => p.id === product.id);
        
        if (isSelected) {
            setTempSelectedProducts(prev => prev.filter(p => p.id !== product.id));
        } else {
            setTempSelectedProducts(prev => [...prev, product]);
        }
    };

    // Selecionar todos os produtos filtrados
    const selectAllProducts = () => {
        console.log("🔘 Selecionando todos os produtos filtrados");
        
        const allFilteredProducts = filteredProducts.filter(product => 
            !tempSelectedProducts.some(selected => selected.id === product.id)
        );
        
        setTempSelectedProducts(prev => [...prev, ...allFilteredProducts]);
    };

    // Desselecionar todos os produtos
    const deselectAllProducts = () => {
        console.log("❌ Desselecionando todos os produtos");
        setTempSelectedProducts([]);
    };

    // Confirmar seleção
    const confirmSelection = () => {
        console.log("✅ Confirmando seleção:", tempSelectedProducts);
        onSelect(tempSelectedProducts);
    };

    // Cancelar e voltar para a seleção original
    const cancelSelection = () => {
        console.log("🔙 Cancelando seleção");
        setTempSelectedProducts([...selectedProducts]);
    };

    // Obter categorias únicas
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="product-selection">
                <h3>Selecionando Produtos</h3>
                <p>Carregando produtos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-selection">
                <h3>Selecionando Produtos</h3>
                <div className="error-message">
                    <p>Erro ao carregar produtos: {error}</p>
                    <Button text="Tentar Novamente" action={loadProducts} />
                </div>
            </div>
        );
    }

    return (
        <div className="product-selection">
            <h3>Selecionar Produtos para o Anúncio</h3>
            <p className="selection-info">
                {tempSelectedProducts.length} produto(s) selecionado(s) de {products.length} disponível(is)
            </p>

            {/* Controles de busca e filtro */}
            <div className="search-controls">
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-filter"
                >
                    <option value="all">Todas as categorias</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Botões de ação em massa */}
            <div className="bulk-actions">
                <Button 
                    text="Selecionar Todos" 
                    action={selectAllProducts}
                    type="button"
                    disabled={filteredProducts.length === 0}
                />
                <Button 
                    text="Desselecionar Todos" 
                    action={deselectAllProducts}
                    type="button"
                    disabled={tempSelectedProducts.length === 0}
                />
            </div>

            {/* Lista de produtos */}
            <div className="products-grid">
                {filteredProducts.length === 0 ? (
                    <p className="no-products">
                        {products.length === 0 ? "Nenhum produto disponível." : "Nenhum produto encontrado com os filtros aplicados."}
                    </p>
                ) : (
                    filteredProducts.map(product => {
                        const isSelected = tempSelectedProducts.some(p => p.id === product.id);
                        
                        return (
                            <div 
                                key={product.id} 
                                className={`product-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleProductSelection(product)}
                            >
                                <div className="product-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}} // Controlado pelo onClick do card
                                        tabIndex={-1}
                                    />
                                </div>
                                
                                <div className="product-info">
                                    <h4>{product.name || 'Produto sem nome'}</h4>
                                    <p className="product-description">
                                        {product.description || 'Sem descrição'}
                                    </p>
                                    <div className="product-details">
                                        <span className="product-price">
                                            {product.price ? `R$ ${product.price.toFixed(2)}` : 'Preço não informado'}
                                        </span>
                                        {product.category && (
                                            <span className="product-category">{product.category}</span>
                                        )}
                                    </div>
                                    {product.quantity !== undefined && (
                                        <p className="product-quantity">Qty: {product.quantity}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Botões de confirmação */}
            <div className="confirmation-actions">
                <Button 
                    text="Confirmar Seleção" 
                    action={confirmSelection}
                    type="button"
                    className="confirm-button"
                />
                <Button 
                    text="Cancelar" 
                    action={cancelSelection}
                    type="button"
                    className="cancel-button"
                />
            </div>
        </div>
    );
}