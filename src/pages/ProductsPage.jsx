import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { ProductAPI } from "../services/ProductAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ProductsPage.module.css";

// Opções de categoria que correspondem ao enum do backend
const OPCOES_CATEGORIA = [
  { value: "BOOK", label: "Livro" },
  { value: "UNIFORM", label: "Uniforme" },
  { value: "PERIPHERAL", label: "Periférico" },
  { value: "BACKPACK", label: "Mochila" },
  { value: "CALCULATOR", label: "Calculadora" },
  { value: "OTHERS", label: "Outros" }
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    forExchange: false,
    quantity: "",
    category: "OTHERS",
    userId: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await ProductAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Erro ao carregar produtos: " + error.message);
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

    console.log("=== DADOS DO FORMULÁRIO ===");
    console.log(formData);

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

    const userIdValue = parseInt(formData.userId);
    if (isNaN(userIdValue) || userIdValue < 1) {
      toast.error("ID do usuário deve ser um número válido maior que zero");
      return;
    }

    // Preparar dados para envio
    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: priceValue,
      forExchange: Boolean(formData.forExchange),
      quantity: quantityValue,
      category: formData.category,
      userId: userIdValue
    };

    console.log("=== DADOS PARA ENVIO ===");
    console.log(productData);

    try {
      let result;
      
      if (editingProduct) {
        console.log("Atualizando produto:", editingProduct.id);
        result = await ProductAPI.update(editingProduct.id, productData);
        
        setProducts(prev => 
          prev.map(p => p.id === result.id ? result : p)
        );
        
        toast.success("Produto atualizado com sucesso!");
      } else {
        console.log("Criando novo produto...");
        result = await ProductAPI.create(productData);
        
        setProducts(prev => [...prev, result]);
        toast.success("Produto criado com sucesso!");
      }

      console.log("Resposta do servidor:", result);
      resetForm();
      
    } catch (error) {
      console.error("=== ERRO DETALHADO ===");
      console.error("Error object:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
      let errorMessage = "Erro desconhecido ao salvar produto";
      
      if (error.response) {
        // Erro HTTP do servidor
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
        // Requisição foi feita mas não houve resposta
        errorMessage = "Servidor não respondeu. Verifique se está rodando.";
      } else {
        // Erro na configuração da requisição
        errorMessage = error.message || "Erro na configuração da requisição";
      }
      
      toast.error(errorMessage);
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
      userId: product.userId?.toString() || "",
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await ProductAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir produto: " + error.message);
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
      userId: "",
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
        {showForm ? (
          <>
            <h1 className={styles.heading}>
              {editingProduct ? "Editar Produto" : "Criar Produto"}
            </h1>
            
            <form onSubmit={handleSave} className={styles.form}>
              <input
                className={styles.input}
                type="text"
                name="title"
                placeholder="Título do produto"
                value={formData.title}
                onChange={handleChange}
                required
              />
              
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

              <textarea
                className={`${styles.input} ${styles.formFullWidth} ${styles.textarea}`}
                name="description"
                placeholder="Descrição detalhada do produto"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <input
                className={styles.input}
                type="text"
                name="price"
                placeholder="Preço (ex: 5.50 ou 5,50)"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <input
                className={styles.input}
                type="number"
                name="quantity"
                placeholder="Quantidade disponível"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />

              <input
                className={styles.input}
                type="number"
                name="userId"
                placeholder="ID do usuário"
                value={formData.userId}
                onChange={handleChange}
                required
                min="1"
              />

              <div className={styles.checkboxContainer}>
                <input
                  id="forExchange"
                  type="checkbox"
                  name="forExchange"
                  checked={formData.forExchange}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="forExchange" className={styles.label}>
                  Aceita troca?
                </label>
              </div>

              <div className={styles.buttonsRow}>
                <button type="submit" className={styles.buttonPrimary}>
                  {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.buttonSecondary}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Lista de Produtos</h1>
            <button 
              onClick={() => setShowForm(true)} 
              className={styles.createButton}
            >
              + Criar Novo Produto
            </button>

            {products.length === 0 ? (
              <div className={styles.noProducts}>
                <p>Nenhum produto cadastrado.</p>
                <p>Clique em "Criar Novo Produto" para começar.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Título</th>
                    <th className={styles.th}>Categoria</th>
                    <th className={styles.th}>Preço</th>
                    <th className={styles.th}>Quantidade</th>
                    <th className={styles.th}>Aceita Troca</th>
                    <th className={styles.th}>Usuário</th>
                    <th className={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((produto) => (
                    <tr key={produto.id}>
                      <td 
                        className={`${styles.td} ${styles.productTitle}`} 
                        title={produto.description}
                      >
                        {produto.title}
                      </td>
                      <td className={styles.td}>
                        {getCategoryLabel(produto.category)}
                      </td>
                      <td className={styles.td}>
                        R$ {Number(produto.price).toFixed(2).replace('.', ',')}
                      </td>
                      <td className={styles.td}>{produto.quantity}</td>
                      <td className={styles.td}>
                        <span className={produto.forExchange ? styles.exchangeYes : styles.exchangeNo}>
                          {produto.forExchange ? "Sim" : "Não"}
                        </span>
                      </td>
                      <td className={styles.td}>{produto.userId}</td>
                      <td className={`${styles.td} ${styles.actionsCell}`}>
                        <button 
                          onClick={() => handleEdit(produto)} 
                          className={styles.buttonSecondary}
                          title="Editar produto"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
                          className={styles.buttonDanger}
                          title="Excluir produto"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default ProductsPage;