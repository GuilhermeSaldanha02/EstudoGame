// js/criar_desafio.js (Versão Integrada com Backend)

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!requireAuth()) {
        return;
    }

    // Inicializar formulário
    initializeChallengeForm();
});

/**
 * Inicializa o formulário de criação de desafios
 */
function initializeChallengeForm() {
    const challengeForm = document.getElementById('challenge-form');
    
    if (challengeForm) {
        challengeForm.addEventListener('submit', handleCreateChallenge);
    }

    // Configurar data mínima para o campo de data final
    const endDateInput = document.getElementById('data_fim');
    if (endDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        endDateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

/**
 * Manipula a criação de um novo desafio
 */
async function handleCreateChallenge(event) {
    event.preventDefault();

    const nomeDesafio = document.getElementById('nome_desafio')?.value?.trim();
    const materia = document.getElementById('materia')?.value?.trim();
    const descricao = document.getElementById('descricao')?.value?.trim();
    const dataFim = document.getElementById('data_fim')?.value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Validação básica
    if (!nomeDesafio || !materia) {
        showError('Por favor, preencha pelo menos o Nome do Desafio e a Matéria.');
        return;
    }

    // Validar data final
    if (dataFim) {
        const endDate = new Date(dataFim);
        const now = new Date();
        if (endDate <= now) {
            showError('A data de fim deve ser no futuro.');
            return;
        }
    }

    // Desabilitar botão e mostrar loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Criando...`;

    try {
        const challengeData = {
            name: nomeDesafio,
            subject: materia,
            description: descricao || null,
            endDate: dataFim || null
        };

        const response = await apiClient.createChallenge(challengeData);
        
        showSuccess(`Desafio "${response.challenge.name}" criado com sucesso!`);
        
        // Limpar formulário
        event.target.reset();
        
        // Opcional: redirecionar para a página de desafios após um delay
        setTimeout(() => {
            if (confirm('Desafio criado! Deseja ir para a página de desafios?')) {
                window.location.href = 'desafios.html';
            }
        }, 2000);

    } catch (error) {
        console.error('Erro ao criar desafio:', error);
        showError(error.message || 'Erro ao criar desafio. Tente novamente.');
    } finally {
        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Pré-visualiza o desafio antes de criar
 */
function previewChallenge() {
    const nomeDesafio = document.getElementById('nome_desafio')?.value?.trim();
    const materia = document.getElementById('materia')?.value?.trim();
    const descricao = document.getElementById('descricao')?.value?.trim();
    const dataFim = document.getElementById('data_fim')?.value;

    if (!nomeDesafio || !materia) {
        showError('Preencha pelo menos o nome e a matéria para visualizar.');
        return;
    }

    const previewHTML = `
        <div class="challenge-preview bg-white p-6 rounded-lg shadow-lg border">
            <h3 class="text-xl font-bold mb-2">${nomeDesafio}</h3>
            <p class="text-gray-600 mb-2">
                <i class="fas fa-book mr-2"></i>
                Matéria: ${materia}
            </p>
            ${descricao ? `
                <p class="text-gray-700 mb-3">
                    <i class="fas fa-info-circle mr-2"></i>
                    ${descricao}
                </p>
            ` : ''}
            ${dataFim ? `
                <p class="text-gray-600">
                    <i class="fas fa-calendar mr-2"></i>
                    Termina em: ${formatDate(dataFim)}
                </p>
            ` : `
                <p class="text-gray-600">
                    <i class="fas fa-infinity mr-2"></i>
                    Sem data de término
                </p>
            `}
            <div class="mt-4 p-3 bg-blue-50 rounded">
                <p class="text-sm text-blue-700">
                    <i class="fas fa-lightbulb mr-1"></i>
                    Este desafio será baseado em horas de estudo. Cada hora vale 10 pontos!
                </p>
            </div>
        </div>
    `;

    // Mostrar preview em um modal ou área específica
    showPreviewModal(previewHTML);
}

/**
 * Mostra o modal de preview
 */
function showPreviewModal(content) {
    // Criar modal dinamicamente
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Preview do Desafio</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${content}
            <div class="mt-6 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    Fechar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar modal clicando fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Carrega sugestões de matérias populares
 */
async function loadSubjectSuggestions() {
    // Esta função pode ser expandida para buscar matérias populares do backend
    const suggestions = [
        'Direito Constitucional',
        'Direito Administrativo',
        'Português',
        'Matemática',
        'Raciocínio Lógico',
        'Informática',
        'Direito Penal',
        'Direito Civil',
        'Contabilidade',
        'Administração Pública'
    ];

    const materiaInput = document.getElementById('materia');
    if (materiaInput) {
        // Adicionar datalist para autocomplete
        const datalist = document.createElement('datalist');
        datalist.id = 'materias-suggestions';
        
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });

        materiaInput.setAttribute('list', 'materias-suggestions');
        materiaInput.parentNode.appendChild(datalist);
    }
}

// Carregar sugestões quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadSubjectSuggestions, 500);
});

