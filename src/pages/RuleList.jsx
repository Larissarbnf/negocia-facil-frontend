import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Shield, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";
import styles from "./RulesList.module.css";

export default function RulesList() {
  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
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
        setDeleting(id);
        await api.delete(`/rules/${id}`);
        setRules(prevRules => prevRules.filter(rule => rule.id !== id));
      } catch (error) {
        console.error("Erro ao deletar regra:", error);
      } finally {
        setDeleting(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.pageContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <button
                onClick={() => navigate("/admin")}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
            </div>
            
            <div className={styles.headerCenter}>
              <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>
                  <Shield className={styles.titleIcon} />
                  Regras do Sistema
                </h1>
                <p className={styles.pageSubtitle}>
                  Gerencie as regras e políticas do sistema
                </p>
              </div>
            </div>

            <div className={styles.headerRight}>
              <button
                onClick={() => navigate("/rules/new")}
                className={styles.createButton}
              >
                <Plus size={20} />
                <span>Nova Regra</span>
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Pesquisar regras por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearch}
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsSection}>
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{rules.length}</span>
                <span className={styles.statLabel}>Total de Regras</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {rules.filter(rule => rule.active).length}
                </span>
                <span className={styles.statLabel}>Regras Ativas</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {filteredRules.length}
                </span>
                <span className={styles.statLabel}>Resultados</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <h3>Carregando regras</h3>
              <p>Aguarde enquanto buscamos as informações...</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {searchTerm ? <Search size={64} /> : <Shield size={64} />}
              </div>
              <h3>
                {searchTerm ? 'Nenhuma regra encontrada' : 'Nenhuma regra cadastrada'}
              </h3>
              <p>
                {searchTerm 
                  ? `Não encontramos regras com o termo "${searchTerm}". Tente outro termo de busca.`
                  : 'Comece criando sua primeira regra do sistema'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => navigate("/rules/new")} 
                  className={styles.emptyButton}
                >
                  <Plus size={20} />
                  Criar Primeira Regra
                </button>
              )}
            </div>
          ) : (
            <div className={styles.rulesContainer}>
              <div className={styles.rulesHeader}>
                <h2 className={styles.rulesTitle}>
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas as Regras'}
                </h2>
                <span className={styles.rulesCount}>
                  {filteredRules.length} regra{filteredRules.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className={styles.rulesGrid}>
                {filteredRules.map((rule) => (
                  <div key={rule.id} className={styles.ruleCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <h3 className={styles.ruleTitle}>{rule.title}</h3>
                        {rule.active !== undefined && (
                          <div className={`${styles.statusBadge} ${
                            rule.active ? styles.statusActive : styles.statusInactive
                          }`}>
                            {rule.active ? (
                              <>
                                <CheckCircle size={14} />
                                <span>Ativa</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                <span>Inativa</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.cardActions}>
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
                          disabled={deleting === rule.id}
                        >
                          {deleting === rule.id ? (
                            <div className={styles.miniSpinner}></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.ruleDescription}>
                        {rule.description.length > 150
                          ? `${rule.description.substring(0, 150)}...`
                          : rule.description
                        }
                      </p>
                    </div>

                    {rule.createdAt && (
                      <div className={styles.cardFooter}>
                        <span className={styles.ruleDate}>
                          📅 Criada em {formatDate(rule.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}