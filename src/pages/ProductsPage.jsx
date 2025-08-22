import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { ProductAPI } from "../services/ProductAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ProductsPage.module.css";

// Opções de categoria que correspondem ao enum do backend
const OPCOES_CATEGORIA = [
  { value: "BOOK", label: "📚 Livro" },
  { value: "UNIFORM", label: "👕 Uniforme" },
  { value: "PERIPHERAL", label: "🖱️ Periférico" },
  { value: "BACKPACK", label: "🎒 Mochila" },
  { value: "CALCULATOR", label: "🔢 Calculadora" },
  { value: "OTHERS", label: "📦 Outros" }
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    forExchange: false,
    quantity: "",
    category: "OTHERS",
  });

  // Simulação do usuário logado - substitua pela lógica real de autenticação
  const currentUserId = 1; // TODO: Pegar do contexto de autenticação

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await ProductAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Erro ao carregar produtos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  // Função para converter vírgula em ponto (padrão brasileiro vs americano)
  function parsePrice(priceString) {
    if (!priceString) return 0;
    // Converte vírgula para ponto e remove espaços
    const cleanPrice = String(priceString).replace(',', '.').trim();
    const parsedPrice = parseFloat(cleanPrice);
    return isNaN(parsedPrice) ? 0 : parsedPrice;
  }

  async function handleSave(e) {
    e.preventDefault();

    // Validações básicas
    if (!formData.title?.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    const priceValue = parsePrice(formData.price);
    if (priceValue < 0) {
      toast.error("Preço deve ser maior ou igual a zero");
      return;
    }

    const quantityValue = parseInt(formData.quantity);
    if (isNaN(quantityValue) || quantityValue < 0) {
      toast.error("Quantidade deve ser um número válido maior ou igual a zero");
      return;
    }

    // Preparar dados para envio (userId vem do usuário logado)
    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: priceValue,
      forExchange: Boolean(formData.forExchange),
      quantity: quantityValue,
      category: formData.category,
      userId: currentUserId
    };

    setLoading(true);
    try {
      let result;
      
      if (editingProduct) {
        result = await ProductAPI.update(editingProduct.id, productData);
        setProducts(prev => 
          prev.map(p => p.id === result.id ? result : p)
        );
        toast.success("Produto atualizado com sucesso!");
      } else {
        result = await ProductAPI.create(productData);
        setProducts(prev => [...prev, result]);
        toast.success("Produto criado com sucesso!");
      }

      resetForm();
      
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      
      let errorMessage = "Erro desconhecido ao salvar produto";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = "Dados inválidos enviados";
            if (data && typeof data === 'object') {
              errorMessage += ": " + JSON.stringify(data);
            }
            break;
          case 422:
            errorMessage = "Erro de validação no servidor";
            break;
          case 500:
            errorMessage = "Erro interno do servidor";
            break;
          default:
            errorMessage = `Erro HTTP ${status}`;
        }
      } else if (error.request) {
        errorMessage = "Servidor não respondeu. Verifique se está rodando.";
      } else {
        errorMessage = error.message || "Erro na configuração da requisição";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      forExchange: product.forExchange || false,
      quantity: product.quantity?.toString() || "",
      category: product.category || "OTHERS",
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    setLoading(true);
    try {
      await ProductAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir produto: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      forExchange: false,
      quantity: "",
      category: "OTHERS",
    });
  }

  function getCategoryLabel(categoryValue) {
    const categoria = OPCOES_CATEGORIA.find(cat => cat.value === categoryValue);
    return categoria ? categoria.label : categoryValue;
  }

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          {showForm ? (
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h1 className={styles.heading}>
                  {editingProduct ? "✏️ Editar Produto" : "➕ Criar Novo Produto"}
                </h1>
                <p className={styles.subheading}>
                  {editingProduct 
                    ? "Atualize as informações do seu produto" 
                    : "Preencha os dados do seu produto para venda ou troca"
                  }
                </p>
              </div>
              
              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Título do Produto *</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="title"
                    placeholder="Ex: Livro de Cálculo I - Estado novo"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength="100"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Categoria *</label>
                  <select
                    className={styles.select}
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {OPCOES_CATEGORIA.map((categoria) => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Descrição *</label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    name="description"
                    placeholder="Descreva detalhadamente o produto: estado de conservação, marca, modelo, etc."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength="500"
                    rows={4}
                  />
                  <span className={styles.charCount}>
                    {formData.description.length}/500 caracteres
                  </span>
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Preço (R$) *</label>
                    <input
                      className={styles.input}
                      type="text"
                      name="price"
                      placeholder="Ex: 25,50"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Quantidade *</label>
                    <input
                      className={styles.input}
                      type="number"
                      name="quantity"
                      placeholder="Ex: 1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="forExchange"
                      checked={formData.forExchange}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      🔄 Aceito trocas por outros produtos
                    </span>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button"
                    onClick={resetForm}
                    className={styles.buttonSecondary}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className={styles.buttonPrimary}
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : editingProduct ? "Salvar Alterações" : "Criar Produto"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <div>
                  <h1 className={styles.heading}>📦 Meus Produtos</h1>
                  <p className={styles.subheading}>
                    Gerencie seus produtos para venda e troca
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(true)} 
                  className={styles.createButton}
                  disabled={loading}
                >
                  <span className={styles.buttonIcon}>+</span>
                  Novo Produto
                </button>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📦</div>
                  <h3>Nenhum produto cadastrado</h3>
                  <p>Comece criando seu primeiro produto para venda ou troca</p>
                  <button 
                    onClick={() => setShowForm(true)} 
                    className={styles.emptyButton}
                  >
                    Criar Primeiro Produto
                  </button>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Produto</th>
                          <th className={styles.th}>Categoria</th>
                          <th className={styles.th}>Preço</th>
                          <th className={styles.th}>Qtd.</th>
                          <th className={styles.th}>Troca</th>
                          <th className={styles.th}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((produto) => (
                          <tr key={produto.id}>
                            <td className={styles.td}>
                              <div className={styles.productInfo}>
                                <span className={styles.productTitle}>
                                  {produto.title}
                                </span>
                                <span className={styles.productDescription}>
                                  {produto.description.length > 60 
                                    ? produto.description.substring(0, 60) + "..." 
                                    : produto.description
                                  }
                                </span>
                              </div>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.categoryBadge}>
                                {getCategoryLabel(produto.category)}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.price}>
                                R$ {Number(produto.price).toFixed(2).replace('.', ',')}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.quantity}>{produto.quantity}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={produto.forExchange ? styles.exchangeYes : styles.exchangeNo}>
                                {produto.forExchange ? "Sim" : "Não"}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <div className={styles.actions}>
                                <button 
                                  onClick={() => handleEdit(produto)} 
                                  className={styles.actionButton}
                                  title="Editar produto"
                                  disabled={loading}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(produto.id)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                  title="Excluir produto"
                                  disabled={loading}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default ProductsPage;