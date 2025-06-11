// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Classe para gerenciar autenticação e requisições
class ApiClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Método para fazer requisições autenticadas
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token de autenticação se disponível
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Métodos de autenticação
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    // Métodos de usuário
    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Métodos de desafios
    async getChallenges() {
        return await this.request('/challenges');
    }

    async createChallenge(challengeData) {
        return await this.request('/challenges', {
            method: 'POST',
            body: JSON.stringify(challengeData)
        });
    }

    async getChallengeById(id) {
        return await this.request(`/challenges/${id}`);
    }

    async joinChallenge(id) {
        return await this.request(`/challenges/${id}/join`, {
            method: 'POST'
        });
    }

    async getChallengeRanking(id) {
        return await this.request(`/challenges/${id}/ranking`);
    }

    // Métodos de sessões de estudo
    async getStudySessions(page = 1, limit = 10) {
        return await this.request(`/study-sessions?page=${page}&limit=${limit}`);
    }

    async createStudySession(sessionData) {
        return await this.request('/study-sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    async updateStudySession(id, sessionData) {
        return await this.request(`/study-sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(sessionData)
        });
    }

    async deleteStudySession(id) {
        return await this.request(`/study-sessions/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos de gerenciamento de token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // Método para logout
    logout() {
        this.removeToken();
        window.location.href = 'login.html';
    }
}

// Instância global do cliente da API
const apiClient = new ApiClient();

// Função utilitária para mostrar mensagens de erro
function showError(message) {
    // Criar um elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Função utilitária para mostrar mensagens de sucesso
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ed573;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Função para verificar autenticação em páginas protegidas
function requireAuth() {
    if (!apiClient.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Função para formatar tempo em segundos para formato legível
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

