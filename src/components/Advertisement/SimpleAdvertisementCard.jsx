import React, { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import './SimpleAdvertisementCard.css';

function SimpleAdvertisementCard({
    id,
    creationTime,
    itemsCount,
    description,
    onEdit,
    onDelete
}) {
    const [showMenu, setShowMenu] = useState(false);

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onEdit && typeof onEdit === 'function') {
            onEdit();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onDelete && typeof onDelete === 'function') {
            const confirmDelete = window.confirm(`Tem certeza que deseja excluir o Anúncio ${id}?`);
            if (confirmDelete) {
                onDelete(id);
            }
        }
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(prev => !prev);
    };

    const closeMenu = () => {
        setShowMenu(false);
    };

    return (
        <div className='user-advertisement-card'>
            <div className='card-content'>
                <div className='card-header'>
                    <div className="card-title-section">
                        <h2>Anúncio #{id}</h2>
                        <p className="creation-time">Criado em {creationTime}</p>
                    </div>
                    
                    <div 
                        className="advertisement-dropdown"
                        onMouseLeave={closeMenu}
                    >
                        <button 
                            className="menu-trigger"
                            onClick={toggleMenu}
                            aria-label="Menu de opções"
                        >
                            <MoreVertical size={18} />
                        </button>
                        
                        {showMenu && (
                            <div className="dropdown-menu">
                                <button 
                                    className="dropdown-item edit-btn"
                                    onClick={handleEdit}
                                >
                                    <Edit size={14} />
                                    Editar
                                </button>
                                <button 
                                    className="dropdown-item delete-btn"
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={14} />
                                    Excluir
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className='card-subinfo'>
                    <p className="items-count">
                        <span className="count-badge">{itemsCount || 0}</span>
                        {itemsCount === 1 ? ' item no anúncio' : ' itens no anúncio'}
                    </p>
                </div>

                <div className="card-description">
                    <p>
                        <strong>Descrição:</strong> 
                        <span className="description-text">
                            {description || 'Sem descrição'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SimpleAdvertisementCard;