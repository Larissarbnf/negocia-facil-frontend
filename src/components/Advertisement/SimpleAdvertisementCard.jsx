import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SimpleAdvertisementCard.css';

function SimpleAdvertisementCard({
    id,
    creationTime,
    description,
    itemsCount,
    onDelete,
    onEdit,
    onViewDetails
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
            await onDelete();
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit();
    };

    // 🔧 CORREÇÃO: Função para redirecionar aos detalhes
    const handleViewDetails = () => {
        console.log('🔍 Redirecionando para detalhes do anúncio ID:', id);
        
        // Se onViewDetails foi passado como prop, usar ele
        if (onViewDetails && typeof onViewDetails === 'function') {
            onViewDetails();
        } else {
            // Senão, usar navegação direta
            navigate(`/advertisements/details/${id}`);
        }
    };

    return (
        <div 
            className="advertisement-card"
            onClick={handleViewDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleViewDetails();
                }
            }}
        >
            {/* Dica de clique */}
            <div className="click-hint">
                Clique para ver detalhes
            </div>

            {/* Header do Card */}
            <div className="card-header">
                <div className="id-badge">
                    #{String(id).padStart(3, '0')}
                </div>
                
                <div className="status-badge">
                    <div className="status-dot"></div>
                    Ativo
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="card-content">
                <h3 className="card-title">
                    Anúncio #{String(id).padStart(3, '0')}
                </h3>
                
                <p className="card-description">
                    {description || "Sem descrição disponível"}
                </p>

                {/* Estatísticas do Anúncio */}
                <div className="card-stats">
                    <div className="stat-item">
                        <span className="stat-value">{itemsCount}</span>
                        <span className="stat-label">
                            {itemsCount === 1 ? 'Produto' : 'Produtos'}
                        </span>
                    </div>
                    
                    <div className="stat-item">
                        <span className="stat-value">Criado</span>
                        <span className="stat-label">{creationTime}</span>
                    </div>
                </div>
            </div>

            {/* Ações do Card */}
            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="action-btn btn-edit"
                    onClick={handleEdit}
                    aria-label="Editar anúncio"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Editar
                </button>
                
                <button 
                    className={`action-btn btn-delete ${isDeleting ? 'loading' : ''}`}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label="Excluir anúncio"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </div>
    );
}

export default SimpleAdvertisementCard;