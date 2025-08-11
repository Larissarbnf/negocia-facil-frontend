// EditProfileModal.jsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        whatsappNumber: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Preencher formulário quando o modal abrir
    useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                fullName: userData.fullName || '',
                whatsappNumber: userData.whatsappNumber || '',
                username: userData.username || ''
            });
            setErrors({});
        }
    }, [isOpen, userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Formatação especial para WhatsApp
        if (name === 'whatsappNumber') {
            // Remove tudo que não é número
            const numbers = value.replace(/\D/g, '');
            
            // Aplica máscara: (XX) XXXXX-XXXX
            let formatted = numbers;
            if (numbers.length >= 11) {
                formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
            } else if (numbers.length >= 7) {
                formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
            } else if (numbers.length >= 2) {
                formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
            }
            
            setFormData(prev => ({
                ...prev,
                [name]: formatted
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpar erro do campo quando usuário digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar nome
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nome completo é obrigatório';
        }

        // Validar WhatsApp (opcional, mas se preenchido deve ser válido)
        if (formData.whatsappNumber.trim()) {
            const numbers = formData.whatsappNumber.replace(/\D/g, '');
            if (numbers.length < 10) {
                newErrors.whatsappNumber = 'Número deve ter pelo menos 10 dígitos';
            } else if (numbers.length > 11) {
                newErrors.whatsappNumber = 'Número deve ter no máximo 11 dígitos';
            }
        }

        // Validar username
        if (!formData.username.trim()) {
            newErrors.username = 'Username é obrigatório';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username deve ter pelo menos 3 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 🎯 FUNÇÃO CORRIGIDA COM VALIDAÇÃO ROBUSTA DO TOKEN
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // 🔍 VALIDAÇÃO RIGOROSA DO TOKEN
        const token = localStorage.getItem('token');
        console.log("🔐 Token recuperado:", token);
        console.log("🔐 Token length:", token?.length);
        console.log("🔐 Token type:", typeof token);
        console.log("🔐 Token preview:", token?.substring(0, 30) + "...");
        
        // ✅ VERIFICAÇÃO ROBUSTA
        if (!token || 
            token === 'undefined' || 
            token === 'null' || 
            token.trim() === '' ||
            token === null ||
            token === undefined) {
            console.error("❌ Token inválido detectado:", token);
            alert("❌ Sessão expirou ou token inválido. Faça login novamente.");
            localStorage.clear();
            window.location.href = "/login";
            setLoading(false);
            return;
        }

        try {
            // 📤 PREPARAR DADOS PARA ENVIAR
            const dataToSend = {
                fullName: formData.fullName.trim(),
                username: formData.username.trim(),
                whatsappNumber: formData.whatsappNumber.replace(/\D/g, '')
            };

            console.log('📤 Enviando dados:', dataToSend);
            console.log('🔐 Headers que serão enviados:', {
                'Authorization': `Bearer ${token.substring(0, 20)}...`,
                'Content-Type': 'application/json'
            });

            // 🎯 REQUISIÇÃO COM HEADERS CORRETOS
            const response = await axios.put('http://localhost:8080/auth/profile', dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 segundos
            });

            console.log('✅ Resposta recebida:', response.data);
            console.log('✅ Status:', response.status);
            
            // 🔄 ATUALIZAR LOCALSTORAGE COM DADOS CORRETOS
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const newUserData = { 
                ...currentUser, 
                ...response.data,
                // Garantir que os campos editados sejam atualizados
                fullName: dataToSend.fullName,
                username: dataToSend.username,
                whatsappNumber: dataToSend.whatsappNumber
            };
            localStorage.setItem('user', JSON.stringify(newUserData));

            // ✅ SUCESSO
            onSave(newUserData);
            alert('✅ Perfil atualizado com sucesso!');
            onClose();

        } catch (error) {
            console.error('❌ Erro completo:', error);
            console.error('❌ Error config:', error.config);
            
            // 🔍 ANÁLISE DETALHADA DO ERRO
            if (error.response) {
                console.error('📋 Status:', error.response.status);
                console.error('📋 Data:', error.response.data);
                console.error('📋 Headers response:', error.response.headers);
                console.error('📋 Token usado:', token?.substring(0, 20) + '...');
                
                // 🚨 TRATAMENTO ESPECÍFICO POR STATUS
                switch (error.response.status) {
                    case 403:
                        console.error("❌ ERRO 403: Forbidden - Token inválido ou sem permissão");
                        alert("❌ Token inválido ou sem permissão. Faça login novamente.");
                        localStorage.clear();
                        setTimeout(() => {
                            window.location.href = "/login";
                        }, 1000);
                        break;
                        
                    case 401:
                        console.error("❌ ERRO 401: Unauthorized - Token expirado");
                        alert("❌ Token expirado. Faça login novamente.");
                        localStorage.clear();
                        setTimeout(() => {
                            window.location.href = "/login";
                        }, 1000);
                        break;
                        
                    case 400:
                        const message = error.response.data?.message || 'Dados inválidos';
                        console.error("❌ ERRO 400: Bad Request -", message);
                        alert(`❌ Erro de validação: ${message}`);
                        break;
                        
                    case 500:
                        console.error("❌ ERRO 500: Internal Server Error");
                        alert("❌ Erro interno do servidor. Tente novamente em alguns minutos.");
                        break;
                        
                    default:
                        const defaultMessage = error.response.data?.message || `Erro HTTP ${error.response.status}`;
                        alert(`❌ ${defaultMessage}`);
                }
                
            } else if (error.request) {
                console.error('❌ Nenhuma resposta do servidor:', error.request);
                alert("❌ Servidor não está respondendo. Verifique sua conexão com a internet.");
            } else {
                console.error('❌ Erro na configuração da requisição:', error.message);
                alert(`❌ Erro de configuração: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>✏️ Editar Perfil</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName">
                            <span className={styles.labelIcon}>👤</span>
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={errors.fullName ? styles.inputError : ''}
                            disabled={loading}
                            placeholder="Seu nome completo"
                        />
                        {errors.fullName && (
                            <span className={styles.errorMessage}>{errors.fullName}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="username">
                            <span className={styles.labelIcon}>🏷️</span>
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={errors.username ? styles.inputError : ''}
                            disabled={loading}
                            placeholder="Seu username"
                        />
                        {errors.username && (
                            <span className={styles.errorMessage}>{errors.username}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="whatsappNumber">
                            <span className={styles.labelIcon}>📱</span>
                            WhatsApp (opcional)
                        </label>
                        <input
                            type="text"
                            id="whatsappNumber"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleInputChange}
                            className={errors.whatsappNumber ? styles.inputError : ''}
                            disabled={loading}
                            placeholder="(xx) xxxxx-xxxx"
                            maxLength={15}
                        />
                        <small className={styles.fieldHelp}>
                            Adicione seu WhatsApp para que outros usuários possam te contatar
                        </small>
                        {errors.whatsappNumber && (
                            <span className={styles.errorMessage}>{errors.whatsappNumber}</span>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    💾 Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;