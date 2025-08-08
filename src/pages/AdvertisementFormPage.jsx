import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import AdvertisementForm from "../components/Advertisement/AdvertisementForm";
import { AdvertisementAPI } from "../services/AdvertisementAPI";
import './AdvertisementFormPage.css';

export function AdvertisementFormPage() {
    const navigate = useNavigate();

    // Função para obter o ID do usuário logado
    const getCurrentUserId = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                return parsed.id || parsed.userId;
            }
        } catch (e) {
            console.log('Erro ao parsear dados do usuário:', e);
        }

        const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
        if (userId) {
            return parseInt(userId);
        }

        console.warn('⚠️ ID do usuário não encontrado, usando ID padrão: 1');
        return 1;
    };

    const [advertisement, setAdvertisement] = useState({
        description: "",
        products: [],
        advertiserId: getCurrentUserId(),
        createdAt: new Date().toISOString(),
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.body.classList.remove("modal-open", "overlay", "backdrop", "darken");
        return () => {
            document.body.classList.remove("modal-open", "overlay", "backdrop", "darken");
        };
    }, []);

    async function handleCreate(newAdvertisement) {
        console.log('🔥 BOTÃO CRIAR CLICADO! Dados recebidos:', newAdvertisement);

        if (!newAdvertisement) {
            console.error('❌ Dados do anúncio não fornecidos');
            alert("Dados do anúncio inválidos");
            return;
        }

        if (!newAdvertisement.advertiserId) {
            console.log('⚠️ advertiserId não encontrado, adicionando...');
            newAdvertisement.advertiserId = getCurrentUserId();
        }

        if (!newAdvertisement.description?.trim()) {
            alert("A descrição do anúncio é obrigatória!");
            return;
        }

        if (!newAdvertisement.advertiserId) {
            alert("Não foi possível identificar o usuário. Faça login novamente.");
            navigate("/auth/login");
            return;
        }

        try {
            console.log('➕ Criando novo anúncio...', newAdvertisement);
            console.log('🔍 Dados que serão enviados:', {
                description: newAdvertisement.description,
                advertiserId: newAdvertisement.advertiserId,
                products: newAdvertisement.products || []
            });

            if (!AdvertisementAPI || typeof AdvertisementAPI.create !== 'function') {
                throw new Error('API de anúncios não disponível ou método create ausente');
            }

            setIsLoading(true);

            const created = await AdvertisementAPI.create(newAdvertisement);
            console.log('✅ Anúncio criado com sucesso:', created);
            alert("Anúncio criado com sucesso!");

            if (created && created.id) {
                navigate(`/advertisements/${created.id}`);
            } else {
                navigate("/advertisements");
            }

        } catch (error) {
            console.error('❌ Erro ao criar anúncio:', error);

            let errorMessage = "Erro ao criar anúncio";
            if (error.message.includes('400')) {
                errorMessage = "Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos.";
            } else if (error.message.includes('401')) {
                errorMessage = "Sessão expirada. Faça login novamente.";
            } else if (error.message.includes('403')) {
                errorMessage = "Acesso negado. Você não tem permissão.";
            } else if (error.message.includes('500')) {
                errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
            } else if (error.message.includes('network') || error.message.includes('conexão')) {
                errorMessage = "Erro de conexão. Verifique se o servidor está rodando.";
            } else if (error.message.includes('advertiserId')) {
                errorMessage = "Erro: ID do anunciante é obrigatório. Faça login novamente.";
            } else {
                errorMessage = error.message || "Erro ao criar anúncio";
            }
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    function handleBackToList() {
        console.log('🔙 Voltando para lista de anúncios...');
        navigate("/advertisements");
    }

    if (isLoading) {
        return (
            <div className="advertisements-page-container">
                <Sidebar />
                <div className="advertisement-edition">
                    <h1>Criar Novo Anúncio</h1>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Salvando anúncio...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advertisements-page-container">
            <Sidebar />
            <div className="advertisement-edition">
                <h1>Criar Novo Anúncio</h1>
                <AdvertisementForm
                    advertisement={advertisement}
                    onUpdate={handleCreate}
                    isNew={true}
                />
                <button className="btn-back" onClick={handleBackToList}>
                    ← Voltar para Lista
                </button>
            </div>
        </div>
    );
}