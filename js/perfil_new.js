// js/perfil.js (Versão Integrada com Backend)

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    if (!requireAuth()) {
        return;
    }

    try {
        // Carregar dados do perfil do backend
        await loadUserProfile();
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showError('Erro ao carregar dados do perfil');
    }

    // Adicionar event listeners
    setupEventListeners();
});

/**
 * Carrega os dados do perfil do usuário do backend
 */
async function loadUserProfile() {
    try {
        const response = await apiClient.getProfile();
        const { user, stats } = response;

        // Atualizar informações do usuário
        updateProfileDisplay(user, stats);
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (error.message.includes('Token inválido') || error.message.includes('401')) {
            apiClient.logout();
        } else {
            showError('Erro ao carregar dados do perfil');
        }
    }
}

/**
 * Atualiza a exibição do perfil na página
 */
function updateProfileDisplay(user, stats) {
    // Informações básicas do usuário
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileAvatar) {
        profileAvatar.src = user.avatarUrl || 'https://via.placeholder.com/150';
        profileAvatar.alt = `Avatar de ${user.name}`;
    }

    // Estatísticas do usuário
    const statsHoras = document.getElementById('stats-horas');
    const statsDesafios = document.getElementById('stats-desafios');
    const statsPontos = document.getElementById('stats-pontos');
    const statsSessoes = document.getElementById('stats-sessoes');
    
    if (statsHoras) statsHoras.textContent = stats.totalStudyTimeHours || 0;
    if (statsDesafios) statsDesafios.textContent = stats.totalChallenges || 0;
    if (statsPontos) statsPontos.textContent = user.totalPoints || 0;
    if (statsSessoes) statsSessoes.textContent = stats.totalSessions || 0;

    // Atualizar campos de edição se existirem
    const editNameInput = document.getElementById('edit-name');
    const editAvatarInput = document.getElementById('edit-avatar');
    
    if (editNameInput) editNameInput.value = user.name;
    if (editAvatarInput) editAvatarInput.value = user.avatarUrl || '';
}

/**
 * Configura os event listeners da página
 */
function setupEventListeners() {
    // Botão de editar perfil
    const editBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-profile-modal');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (editBtn && editModal) {
        editBtn.addEventListener('click', () => {
            editModal.style.display = 'block';
        });
    }

    if (cancelBtn && editModal) {
        cancelBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfile);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Fechar modal clicando fora
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }
}

/**
 * Manipula o salvamento do perfil
 */
async function handleSaveProfile() {
    const editNameInput = document.getElementById('edit-name');
    const editAvatarInput = document.getElementById('edit-avatar');
    const saveBtn = document.getElementById('save-profile-btn');
    const editModal = document.getElementById('edit-profile-modal');

    if (!editNameInput?.value.trim()) {
        showError('Nome é obrigatório');
        return;
    }

    // Desabilitar botão e mostrar loading
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...`;

    try {
        const profileData = {
            name: editNameInput.value.trim(),
            avatarUrl: editAvatarInput?.value.trim() || null
        };

        await apiClient.updateProfile(profileData);
        
        showSuccess('Perfil atualizado com sucesso!');
        
        // Recarregar dados do perfil
        await loadUserProfile();
        
        // Fechar modal
        if (editModal) {
            editModal.style.display = 'none';
        }

    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        showError(error.message || 'Erro ao salvar perfil');
    } finally {
        // Restaurar botão
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

/**
 * Manipula o logout do usuário
 */
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        apiClient.logout();
    }
}

/**
 * Carrega e exibe as sessões de estudo recentes
 */
async function loadRecentStudySessions() {
    try {
        const response = await apiClient.getStudySessions(1, 5); // Últimas 5 sessões
        const sessionsContainer = document.getElementById('recent-sessions');
        
        if (!sessionsContainer) return;

        if (response.sessions.length === 0) {
            sessionsContainer.innerHTML = '<p class="text-gray-500">Nenhuma sessão de estudo registrada ainda.</p>';
            return;
        }

        const sessionsHTML = response.sessions.map(session => `
            <div class="session-item bg-white p-4 rounded-lg shadow-sm border">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${session.subject || 'Estudo Geral'}</h4>
                        <p class="text-sm text-gray-600">Duração: ${formatDuration(session.durationSeconds)}</p>
                        <p class="text-sm text-gray-500">${formatDate(session.createdAt)}</p>
                    </div>
                    <div class="text-right">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            +${session.pointsEarned} pts
                        </span>
                    </div>
                </div>
                ${session.notes ? `<p class="mt-2 text-sm text-gray-700">${session.notes}</p>` : ''}
            </div>
        `).join('');

        sessionsContainer.innerHTML = sessionsHTML;

    } catch (error) {
        console.error('Erro ao carregar sessões:', error);
    }
}

// Carregar sessões recentes quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadRecentStudySessions, 1000); // Carregar após o perfil
});

