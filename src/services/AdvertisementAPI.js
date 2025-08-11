// AdvertisementAPI.js - Versão com debug melhorado
const BASE_URL = 'http://localhost:8080/api/v1/advertisements';

// Função helper para obter o token do localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log(`🔑 Token encontrado:`, token.substring(0, 20) + '...');
        return token;
    }
    console.warn('⚠️ Token não encontrado no localStorage');
    return null;
};

// Função helper para criar headers com autenticação
const createAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Header Authorization adicionado:', `Bearer ${token.substring(0, 20)}...`);
    } else {
        console.warn('⚠️ Fazendo requisição sem token de autenticação');
    }

    return headers;
};

// Função para lidar com erros de resposta
const handleApiError = async (response, operation = 'operação') => {
    console.log(`📡 Status da resposta: ${response.status} ${response.statusText}`);

    try {
        const errorText = await response.text();
        console.error(`❌ Texto completo da resposta de erro:`, errorText);
        
        if (response.status === 401) {
            console.error('🚫 Erro 401: Token inválido ou expirado');
            localStorage.removeItem('token');
            throw new Error('Token de autenticação inválido ou expirado. Faça login novamente.');
        }

        if (response.status === 403) {
            console.error('🚫 Erro 403: Acesso negado');
            throw new Error('Acesso negado. Você não tem permissão para esta operação.');
        }

        if (response.status === 404) {
            throw new Error('Recurso não encontrado.');
        }

        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
    } catch (textError) {
        console.error('❌ Erro ao ler texto da resposta:', textError);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
};

export const AdvertisementAPI = {
    // GET /advertisements/{id} - Buscar anúncio específico (VERSÃO MELHORADA)
    async getById(id) {
        try {
            console.log(`🔍 Buscando anúncio com ID: ${id}`);
            console.log(`📍 URL que será chamada: ${BASE_URL}/${id}`);

            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'GET',
                headers: createAuthHeaders(),
            });

            console.log('📡 Resposta recebida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                await handleApiError(response, 'busca do anúncio');
            }

            const data = await response.json();
            console.log('📦 DADOS COMPLETOS DO ANÚNCIO:', data);
            
            // 🎯 LOGS DETALHADOS PARA DEBUG DOS PROBLEMAS
            console.log('🔍 ANÁLISE DETALHADA DOS DADOS:');
            console.log('='.repeat(50));
            
            // Debug do anunciante
            console.log('👤 DADOS DO ANUNCIANTE:');
            console.log('   - advertiser objeto completo:', data.advertiser);
            if (data.advertiser) {
                console.log('   - advertiser.id:', data.advertiser.id);
                console.log('   - advertiser.name:', data.advertiser.name);
                console.log('   - advertiser.username:', data.advertiser.username);
                console.log('   - advertiser.firstName:', data.advertiser.firstName);
                console.log('   - advertiser.lastName:', data.advertiser.lastName);
                console.log('   - advertiser.fullName:', data.advertiser.fullName);
                console.log('   - advertiser.email:', data.advertiser.email);
            }
            
            // Debug do WhatsApp
            console.log('📱 DADOS DO WHATSAPP:');
            console.log('   - whatsappNumber (raiz):', data.whatsappNumber);
            console.log('   - whatsapp (raiz):', data.whatsapp);
            console.log('   - phone (raiz):', data.phone);
            if (data.advertiser) {
                console.log('   - advertiser.whatsappNumber:', data.advertiser.whatsappNumber);
                console.log('   - advertiser.whatsapp:', data.advertiser.whatsapp);
                console.log('   - advertiser.phone:', data.advertiser.phone);
                console.log('   - advertiser.phoneNumber:', data.advertiser.phoneNumber);
                console.log('   - advertiser.celular:', data.advertiser.celular);
                console.log('   - advertiser.telefone:', data.advertiser.telefone);
            }
            
            // Debug de outros campos importantes
            console.log('📋 OUTROS DADOS IMPORTANTES:');
            console.log('   - title:', data.title);
            console.log('   - description:', data.description);
            console.log('   - status:', data.status);
            console.log('   - createdAt:', data.createdAt);
            console.log('   - images:', data.images ? data.images.length : 0, 'imagens');
            console.log('   - products:', data.products ? data.products.length : 0, 'produtos');
            console.log('   - location:', data.location);
            
            console.log('='.repeat(50));

            return data;

        } catch (error) {
            console.error('💥 Erro ao buscar anúncio:', error);
            throw error;
        }
    },

    // GET /advertisements/all - Buscar todos os anúncios
    async getAll() {
        try {
            console.log('🔍 Iniciando busca de anúncios...');
            console.log('🌐 URL:', `${BASE_URL}/all`);

            const headers = createAuthHeaders();
            console.log('📋 Headers:', headers);

            const response = await fetch(`${BASE_URL}/all`, {
                method: 'GET',
                headers,
            });

            if (response.status === 204) {
                console.log('ℹ️ Nenhum anúncio encontrado (NO_CONTENT)');
                return [];
            }

            if (!response.ok) {
                await handleApiError(response, 'busca de anúncios');
            }

            const data = await response.json();
            console.log('✅ Dados recebidos:', data);

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error('💥 Erro ao buscar anúncios:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Erro de conexão com o servidor. Verifique se a API está rodando na porta 8080.');
            }

            throw error;
        }
    },

    // POST /advertisements/create - Criar novo anúncio
    async create(advertisement) {
        try {
            console.log('🔍 DEBUG COMPLETO DA CRIAÇÃO:');
            console.log('📍 URL que será chamada:', `${BASE_URL}/create`);
            console.log('📝 Dados originais recebidos:', advertisement);

            const token = getAuthToken();
            if (!token) {
                throw new Error('⚠️ Token de autenticação não encontrado. Faça login primeiro.');
            }

            const requestData = {
                description: advertisement.description,
                advertiser: {
                    id: advertisement.advertiser ? advertisement.advertiser.id : (advertisement.advertiserId || 2)
                },
                products: advertisement.products || []
            };

            console.log('📤 Dados que serão enviados para o backend:', requestData);

            const response = await fetch(`${BASE_URL}/create`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                await handleApiError(response, 'criação do anúncio');
            }

            const data = await response.json();
            console.log('✅ Anúncio criado com sucesso:', data);

            return data;

        } catch (error) {
            console.error('💥 ERRO COMPLETO na criação do anúncio:', error);
            throw error;
        }
    },

    // PUT /advertisements/{id} - Atualizar anúncio
    async update(id, advertisement) {
        try {
            console.log(`📝 Atualizando anúncio ${id}:`, advertisement);

            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado. Faça login primeiro.');
            }

            const requestData = {
                id,
                description: advertisement.description,
                createdAt: advertisement.createdAt,
                advertiser: advertisement.advertiser,
                products: advertisement.products || []
            };

            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                await handleApiError(response, 'atualização do anúncio');
            }

            const data = await response.json();
            console.log('✅ Anúncio atualizado:', data);

            return data;

        } catch (error) {
            console.error('💥 Erro ao atualizar anúncio:', error);
            throw error;
        }
    },

    // DELETE /advertisements/{id} - Deletar anúncio
    async delete(id) {
        try {
            console.log(`🗑️ Deletando anúncio com ID: ${id}`);

            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado. Faça login primeiro.');
            }

            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: createAuthHeaders(),
            });

            if (response.status === 204) {
                console.log('✅ Anúncio deletado com sucesso');
                return true;
            }

            if (!response.ok) {
                await handleApiError(response, 'exclusão do anúncio');
            }

            console.log('✅ Anúncio deletado com sucesso');
            return true;

        } catch (error) {
            console.error('💥 Erro ao deletar anúncio:', error);
            throw error;
        }
    },

    // Debug de autenticação completo
    debugAuth() {
        console.log('🔍 DEBUG COMPLETO DE AUTENTICAÇÃO:');
        console.log('📍 URL Base:', BASE_URL);

        const token = getAuthToken();
        console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');

        if (token) {
            console.log('📏 Tamanho do token:', token.length);
            console.log('🔤 Primeiros 50 caracteres:', token.substring(0, 50) + '...');
            console.log('🔤 Últimos 50 caracteres:', '...' + token.substring(token.length - 50));
            
            // Tentar decodificar o JWT (apenas para debug)
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('🎭 Payload do token:', payload);
                    console.log('👤 Subject (usuário):', payload.sub);
                    console.log('🎯 Authorities:', payload.authorities || payload.roles || 'Não encontrado');
                    console.log('⏰ Expira em:', new Date(payload.exp * 1000));
                }
            } catch (decodeError) {
                console.warn('⚠️ Não foi possível decodificar o token:', decodeError.message);
            }
        }

        console.log('📋 Headers que serão enviados:', createAuthHeaders());
        console.log('💾 Conteúdo completo do localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`  ${key}:`, value && value.length > 100 ? value.substring(0, 100) + '...' : value);
        }
    }
};