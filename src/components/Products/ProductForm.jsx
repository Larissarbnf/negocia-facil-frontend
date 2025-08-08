import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import styles from "./ProductForm.module.css";

// Categorias definidas como enum do backend
const categories = [
  { id: "BOOK", name: "Livro" },
  { id: "UNIFORM", name: "Uniforme" },
  { id: "PERIPHERAL", name: "Periférico" },
  { id: "BACKPACK", name: "Mochila" },
  { id: "CALCULATOR", name: "Calculadora" },
  { id: "OTHERS", name: "Outros" },
];

function ProductForm({ onSave, onCancel, productToEdit }) {
  const [title, setTitle] = useState(productToEdit?.title || "");
  const [description, setDescription] = useState(productToEdit?.description || "");
  const [price, setPrice] = useState(productToEdit?.price || "");
  const [forExchange, setForExchange] = useState(productToEdit?.forExchange || false);
  const [quantity, setQuantity] = useState(productToEdit?.quantity || 1);
  const [category, setCategory] = useState(productToEdit?.category || "BOOK");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const product = {
      title,
      description,
      price: Number(price),
      forExchange,
      quantity: Number(quantity),
      category,
    };

    console.log("Enviando produto:", product);
    
    // Simular delay de envio
    setTimeout(() => {
      onSave(product);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <button
                type="button"
                onClick={onCancel}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
              </button>
              <div className={styles.headerContent}>
                <h1>{productToEdit ? "Editar Produto" : "Novo Produto"}</h1>
                <p>Preencha as informações do produto abaixo</p>
              </div>
            </div>

            <div className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>Título</label>
                <input
                  type="text"
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do produto"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>Descrição</label>
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu produto..."
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>Categoria</label>
                <select
                  className={styles.input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  required
                />
              </div>

              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="forExchange"
                    className={styles.checkbox}
                    checked={forExchange}
                    onChange={(e) => setForExchange(e.target.checked)}
                  />
                  <div>
                    <label htmlFor="forExchange" className={styles.checkboxLabel}>
                      Disponível para troca
                    </label>
                    <p className={styles.checkboxHelp}>
                      Marque se você aceita trocar este produto por outro item
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={onCancel}
                  className={styles.cancelButton}
                  disabled={isLoading}
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isLoading ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;