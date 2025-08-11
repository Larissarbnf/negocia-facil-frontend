import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdvertisementAPI } from "../services/AdvertisementAPI";
import SimpleAdvertisementCard from "../components/Advertisement/SimpleAdvertisementCard";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Button from "../components/Button/Button.jsx";
import './AdvertisementsPage.css';

function AdvertisementsPage() {
    const navigate = useNavigate();
    
    const [advertisements, setAdvertisements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAdvertisements();
    }, []);

    async function loadAdvertisements() {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('🚀 Carregando anúncios...');
            const data = await AdvertisementAPI.getAll();
            
            console.log('✅ Anúncios carregados:', data);
            setAdvertisements(data);
            
        } catch (error) {
            console.error('❌ Erro ao carregar anúncios:', error);
            setError(error.message);
            
            // Em caso de erro, ainda mostrar uma lista vazia para permitir criar novos
            setAdvertisements([]);
            
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id) => {
        // Confirmação antes de deletar
        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o anúncio ${id}? Esta ação não pode ser desfeita.`
        );
        
        if (!confirmDelete) {
            return;
        }

        try {
            console.log(`🗑️ Deletando anúncio ${id}...`);
            await AdvertisementAPI.delete(id);
            
            console.log('✅ Anúncio deletado com sucesso!');
            alert("Anúncio deletado com sucesso!");
            
            // Recarregar a lista após deletar
            await loadAdvertisements();
            
        } catch (error) {
            console.error('❌ Erro ao deletar anúncio:', error);
            
            if (error.message.includes('404')) {
                alert("Anúncio não encontrado. Talvez já tenha sido deletado.");
            } else {
                alert(`Erro ao deletar anúncio: ${error.message}`);
            }
            
            // Recarregar a lista mesmo em caso de erro para atualizar o estado
            await loadAdvertisements();
        }
    };

    // CORREÇÃO AQUI: Mudança na função handleEdit
    const handleEdit = (id) => {
        console.log(`✏️ Editando anúncio ${id}`);
        navigate(`/advertisements/edit/${id}`); // Rota corrigida com o ID
    };

    const handleNewAdvertisement = () => {
        console.log('➕ Criando novo anúncio');
        navigate("/advertisements/new");
    };

    // Função para formatar a data
    const formatCreationTime = (createdAt) => {
        try {
            const date = new Date(createdAt);
            return date.toLocaleDateString("pt-BR") + " às " + 
                   date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "Data inválida";
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="advertisements-page-container">
                <Sidebar />
                <div className="advertisements-page">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando anúncios...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisements-page-container">
            <Sidebar />
            <div className="advertisements-page">
                <div className="page-header">
                    <h1>Meus Anúncios</h1>
                    <Button 
                        text="Novo anúncio" 
                        action={handleNewAdvertisement}
                        className="btn-primary"
                    />
                </div>

                {/* Mostrar erro se houver */}
                {error && (
                    <div className="error-banner">
                        <p>⚠️ {error}</p>
                        <button onClick={loadAdvertisements} className="retry-btn">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Lista de anúncios ou mensagem vazia */}
                {advertisements.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-content">
                            <h3>📋 Nenhum anúncio encontrado</h3>
                            <p>Você ainda não criou nenhum anúncio. Comece criando seu primeiro anúncio!</p>
                            <Button 
                                text="Criar primeiro anúncio" 
                                action={handleNewAdvertisement}
                                className="btn-primary"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="advertisements-list">
                        {advertisements.map((ad) => (
                            <SimpleAdvertisementCard 
                                key={ad.id} 
                                id={ad.id} 
                                creationTime={formatCreationTime(ad.createdAt)}
                                description={ad.description || "Sem descrição"} 
                                itemsCount={ad.products?.length || 0}
                                onDelete={() => handleDelete(ad.id)}
                                onEdit={() => handleEdit(ad.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdvertisementsPage;