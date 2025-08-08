import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Shield } from "lucide-react";
import api from "../services/api";
import styles from "./RulesList.module.css";

export default function RulesList() {
  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rules");
      setRules(response.data);
    } catch (error) {
      console.error("Erro ao buscar regras:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      try {
        await api.delete(`/rules/${id}`);
        fetchRules(); // recarrega lista após deletar
      } catch (error) {
        console.error("Erro ao deletar regra:", error);
      }
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = rules.filter(rule =>
    rule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div className={styles.header}>
            {/* Botão de voltar para Home */}
            <button
              onClick={() => navigate("/admin")}
              className={styles.backButton}
            >
              ← Voltar 
            </button>

            <div className={styles.titleSection}>
              <h1>Regras do Sistema</h1>
              <p>Gerencie as regras e políticas do sistema</p>
            </div>

            <button
              onClick={() => navigate("/rules/new")}
              className={styles.newButton}
            >
              <Plus size={20} />
              Nova Regra
            </button>
          </div>

          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Pesquisar regras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Carregando regras...</span>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className={styles.emptyState}>
              <Shield size={64} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {searchTerm ? 'Nenhuma regra encontrada com esse termo' : 'Nenhuma regra encontrada'}
              </p>
            </div>
          ) : (
            <div className={styles.rulesGrid}>
              {filteredRules.map((rule) => (
                <div key={rule.id} className={styles.ruleCard}>
                  <div className={styles.ruleContent}>
                    <div className={styles.ruleInfo}>
                      <div className={styles.ruleTitleRow}>
                        <h3 className={styles.ruleTitle}>{rule.title}</h3>
                        {rule.active !== undefined && (
                          <span className={`${styles.statusBadge} ${
                            rule.active ? styles.statusActive : styles.statusInactive
                          }`}>
                            {rule.active ? 'Ativa' : 'Inativa'}
                          </span>
                        )}
                      </div>
                      <p className={styles.ruleDescription}>{rule.description}</p>
                      {rule.createdAt && (
                        <p className={styles.ruleDate}>
                          Criada em {new Date(rule.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className={styles.ruleActions}>
                      <button
                        onClick={() => navigate("/rules/edit", { state: rule })}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar regra"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Excluir regra"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
