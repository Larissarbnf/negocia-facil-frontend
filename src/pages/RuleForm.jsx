import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "../services/api";
import styles from "./RuleForm.module.css";

export default function RuleForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const rule = location.state; // objeto vindo da navegação ao editar

  const [formData, setFormData] = useState({
    title: rule?.title || "",
    description: rule?.description || "",
    active: rule?.active !== undefined ? rule.active : true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: formData.title,
      description: formData.description,
      active: formData.active,
    };

    try {
      if (rule) {
        await api.put(`/rules/${rule.id}`, data);
      } else {
        await api.post("/rules", data);
      }
      navigate("/rules");
    } catch (error) {
      console.error("Erro ao salvar regra:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>        
        <main className={styles.main}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <button
                onClick={() => navigate("/rules")}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
              </button>
              <div className={styles.headerContent}>
                <h1>{rule ? 'Editar Regra' : 'Nova Regra'}</h1>
                <p>
                  {rule ? 'Edite os dados da regra' : 'Preencha os dados para criar uma nova regra'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Título da Regra
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={styles.input}
                  placeholder="Digite o título da regra..."
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles.textarea}
                  placeholder="Descreva a regra em detalhes..."
                  required
                />
              </div>

              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className={styles.checkbox}
                    id="activeRule"
                  />
                  <label htmlFor="activeRule" className={styles.checkboxLabel}>
                    Regra ativa
                  </label>
                </div>
                <p className={styles.checkboxHelp}>
                  Regras inativas não serão aplicadas no sistema
                </p>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {rule ? 'Salvar Alterações' : 'Criar Regra'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/rules")}
                  className={styles.cancelButton}
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}