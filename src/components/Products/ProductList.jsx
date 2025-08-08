import React, { useState } from "react";
import { Search, Filter, Grid, List, Plus, Trash2, Edit, ShoppingCart, Package } from "lucide-react";
import styles from "./ProductList.module.css";


const categoryNames = {
  BOOK: "Livro",
  UNIFORM: "Uniforme", 
  PERIPHERAL: "Periférico",
  BACKPACK: "Mochila",
  CALCULATOR: "Calculadora",
  OTHERS: "Outros"
};

function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  showMenuOptions = true, 
  showTrashButton = true, 
  showCheckBox = false,
  selectedProducts = [],
  toggleProductSelection 
}) {
  const isSelected = selectedProducts.includes(product.id);

  return (
    <div className={styles.productCard}>
      {showCheckBox && (
        <div className={styles.cardCheckbox}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleProductSelection(product.id)}
            className={styles.checkbox}
          />
        </div>
      )}
      
      <div className={styles.cardImage}>
        <div className={styles.placeholderImage}>
          <Package size={32} />
        </div>
        {product.forExchange && (
          <div className={styles.exchangeBadge}>
            Aceita Troca
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{product.title}</h3>
          <div className={styles.cardPrice}>R$ {product.price.toFixed(2)}</div>
        </div>

        <p className={styles.cardDescription}>{product.description}</p>

        <div className={styles.cardMeta}>
          <span className={styles.categoryTag}>
            {categoryNames[product.category]}
          </span>
          <span className={styles.quantity}>Qty: {product.quantity}</span>
        </div>

        {(showMenuOptions || showTrashButton) && (
          <div className={styles.cardActions}>
            {showMenuOptions && (
              <button
                onClick={() => onEdit(product)}
                className={`${styles.actionBtn} ${styles.editBtn}`}
                title="Editar produto"
              >
                <Edit size={16} />
              </button>
            )}
            {showTrashButton && (
              <button
                onClick={() => onDelete(product.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="Excluir produto"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductList({ 
  products = mockProducts, 
  onEdit = () => {}, 
  onDelete = () => {}, 
  showMenuOptions = true, 
  showTrashButton = true, 
  showCheckBox = false,
  selectedProducts = [],
  toggleProductSelection = () => {},
  onAddNew = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      // Deselect all
      filteredProducts.forEach(product => {
        if (selectedProducts.includes(product.id)) {
          toggleProductSelection(product.id);
        }
      });
    } else {
      // Select all
      filteredProducts.forEach(product => {
        if (!selectedProducts.includes(product.id)) {
          toggleProductSelection(product.id);
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          {/* Header */}
          <div className={styles.listHeader}>
            <div className={styles.headerContent}>
              <h1>Meus Produtos</h1>
              <p>Gerencie seus produtos cadastrados</p>
            </div>
            <button onClick={onAddNew} className={styles.addButton}>
              <Plus size={20} />
              Novo Produto
            </button>
          </div>

          {/* Filters and Controls */}
          <div className={styles.controls}>
            <div className={styles.searchFilterGroup}>
              <div className={styles.searchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filterContainer}>
                <Filter size={20} className={styles.filterIcon} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todas as categorias</option>
                  {Object.entries(categoryNames).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.viewControls}>
              {showCheckBox && (
                <div className={styles.bulkActions}>
                  <button
                    onClick={handleSelectAll}
                    className={styles.selectAllBtn}
                  >
                    {selectedProducts.length === filteredProducts.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
                  </button>
                  {selectedProducts.length > 0 && (
                    <span className={styles.selectedCount}>
                      {selectedProducts.length} selecionado(s)
                    </span>
                  )}
                </div>
              )}

              <div className={styles.viewToggle}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`${styles.viewBtn} ${viewMode === "grid" ? styles.active : ""}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={`${styles.productsContainer} ${styles[viewMode]}`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  showMenuOptions={showMenuOptions}
                  showTrashButton={showTrashButton}
                  showCheckBox={showCheckBox}
                  selectedProducts={selectedProducts}
                  toggleProductSelection={toggleProductSelection}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <ShoppingCart size={64} />
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros ou adicione um novo produto</p>
                <button onClick={onAddNew} className={styles.addButton}>
                  <Plus size={20} />
                  Adicionar Primeiro Produto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;