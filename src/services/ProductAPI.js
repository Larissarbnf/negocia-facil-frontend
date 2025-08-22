// ProductAPI.js
const BASE_URL = 'http://localhost:8080/api/v1'; // Ajuste conforme sua API

export const ProductAPI = {
    // GET /products - Buscar todos os produtos
    async getAll() {
        try {
            console.log('🔍 Buscando produtos...');
            
            const response = await fetch(`${BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Adicione headers de autenticação se necessário
                    // 'Authorization': `Bearer ${token}`
                },
            });
            
            console.log('📡 Resposta da API de produtos:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta de produtos:', errorText);
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Produtos recebidos:', data);
            
            // Garantir que sempre retorna um array
            return Array.isArray(data) ? data : [];
            
        } catch (error) {
            console.error('💥 Erro ao buscar produtos:', error);
            
            // Se for erro de rede/conexão
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Erro de conexão com o servidor. Verifique se a API está rodando.');
            }
            
            throw error;
        }
    },

    // GET /products/:id - Buscar produto específico
    async getById(id) {
        try {
            console.log(`🔍 Buscando produto com ID: ${id}`);
            
            const response = await fetch(`${BASE_URL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Produto não encontrado.');
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Produto encontrado:', data);
            
            return data;
            
        } catch (error) {
            console.error('💥 Erro ao buscar produto:', error);
            throw error;
        }
    },

   // POST /products - Criar novo produto
async create(product) {
    try {
        console.log('📝 Criando novo produto:', product);

        const token = localStorage.getItem("token"); // Pega o token armazenado
        if (!token) {
            throw new Error("⚠️ Nenhum token JWT encontrado. Faça login primeiro.");
        }

        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envia token
            },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Produto criado:', data);

        return data;

    } catch (error) {
        console.error('💥 Erro ao criar produto:', error);
        throw error;
    }
},
   // PUT /products/:id - Atualizar produto (COM JWT)
async update(id, product) {
    try {
        console.log(`📝 Atualizando produto ${id}:`, product);
        
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("⚠️ Nenhum token JWT encontrado. Faça login primeiro.");
        }
        
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Adicionar token
            },
            body: JSON.stringify(product),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 403) {
                throw new Error(`Erro 403: Você não tem permissão para atualizar este produto.`);
            }
            if (response.status === 401) {
                throw new Error(`Erro 401: Token inválido ou expirado. Faça login novamente.`);
            }
            
            throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Produto atualizado:', data);
        
        return data;
        
    } catch (error) {
        console.error('💥 Erro ao atualizar produto:', error);
        throw error;
    }

    },


   // DELETE /products/:id - Deletar produto 
async delete(id) {
    try {
        console.log(`🗑️ Deletando produto com ID: ${id}`);
        
        // ADICIONAR TOKEN JWT - igual ao método create
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("⚠️ Nenhum token JWT encontrado. Faça login primeiro.");
        }
        
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ← ESTA LINHA ESTAVA FALTANDO!
            },
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
            
            if (response.status === 403) {
                throw new Error(`Erro 403: Você não tem permissão para deletar este produto. ${errorText}`);
            }
            if (response.status === 401) {
                throw new Error(`Erro 401: Token inválido ou expirado. Faça login novamente.`);
            }
            
            throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        console.log('✅ Produto deletado com sucesso');
        return true;
        
    } catch (error) {
        console.error('💥 Erro ao deletar produto:', error);
        throw error;
    }
}
};