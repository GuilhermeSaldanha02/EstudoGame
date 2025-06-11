// js/registro_de_estudos.js (Versão Integrada com Backend)

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!requireAuth()) {
        return;
    }

    // Inicializar componentes
    initializeTimer();
    initializeManualEntry();
    loadStudySessions();
});

// Variáveis do cronômetro
let timerInterval = null;
let seconds = 0;
let isRunning = false;

/**
 * Inicializa o cronômetro
 */
function initializeTimer() {
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-session-btn');

    // Event Listeners
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentSession);

    // Atualizar display inicial
    updateTimerDisplay();
}

/**
 * Inicializa o formulário de entrada manual
 */
function initializeManualEntry() {
    const manualForm = document.getElementById('manual-entry-form');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualEntry);
    }
}

/**
 * Formata o tempo em formato HH:MM:SS
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
}

/**
 * Atualiza o display do cronômetro
 */
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(seconds);
    }
}

/**
 * Inicia o cronômetro
 */
function startTimer() {
    if (timerInterval) return; // Não inicia se já estiver rodando
    
    isRunning = true;
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);

    // Atualizar estado dos botões
    updateTimerButtons();
}

/**
 * Pausa o cronômetro
 */
function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    updateTimerButtons();
}

/**
 * Reseta o cronômetro
 */
function resetTimer() {
    pauseTimer();
    seconds = 0;
    updateTimerDisplay();
    updateTimerButtons();
}

/**
 * Atualiza o estado dos botões do cronômetro
 */
function updateTimerButtons() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-session-btn');

    if (startBtn) startBtn.disabled = isRunning;
    if (pauseBtn) pauseBtn.disabled = !isRunning;
    if (resetBtn) resetBtn.disabled = isRunning;
    if (saveBtn) saveBtn.disabled = seconds === 0;
}

/**
 * Salva a sessão atual do cronômetro
 */
async function saveCurrentSession() {
    if (seconds === 0) {
        showError('Nenhum tempo registrado para salvar');
        return;
    }

    const subject = document.getElementById('timer-subject')?.value || '';
    const notes = document.getElementById('timer-notes')?.value || '';

    await saveStudySession(seconds, subject, notes);
    
    // Resetar cronômetro após salvar
    resetTimer();
    
    // Limpar campos
    const subjectInput = document.getElementById('timer-subject');
    const notesInput = document.getElementById('timer-notes');
    if (subjectInput) subjectInput.value = '';
    if (notesInput) notesInput.value = '';
}

/**
 * Manipula a entrada manual de tempo
 */
async function handleManualEntry(event) {
    event.preventDefault();

    const hoursInput = document.getElementById('manual-hours');
    const minutesInput = document.getElementById('manual-minutes');
    const subjectInput = document.getElementById('manual-subject');
    const notesInput = document.getElementById('manual-notes');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const hours = parseInt(hoursInput?.value || 0);
    const minutes = parseInt(minutesInput?.value || 0);
    const subject = subjectInput?.value || '';
    const notes = notesInput?.value || '';

    if (hours === 0 && minutes === 0) {
        showError('Informe pelo menos 1 minuto de estudo');
        return;
    }

    const totalSeconds = (hours * 3600) + (minutes * 60);

    // Desabilitar botão
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...`;

    try {
        await saveStudySession(totalSeconds, subject, notes);
        
        // Limpar formulário
        event.target.reset();
        
    } catch (error) {
        // Erro já tratado na função saveStudySession
    } finally {
        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Salva uma sessão de estudo no backend
 */
async function saveStudySession(durationSeconds, subject, notes) {
    try {
        const sessionData = {
            durationSeconds,
            subject: subject.trim() || null,
            notes: notes.trim() || null
        };

        const response = await apiClient.createStudySession(sessionData);
        
        showSuccess(`Sessão de ${formatDuration(durationSeconds)} salva! +${response.session.pointsEarned} pontos`);
        
        // Recarregar lista de sessões
        await loadStudySessions();
        
    } catch (error) {
        console.error('Erro ao salvar sessão:', error);
        showError(error.message || 'Erro ao salvar sessão de estudo');
        throw error;
    }
}

/**
 * Carrega e exibe as sessões de estudo
 */
async function loadStudySessions() {
    try {
        const response = await apiClient.getStudySessions(1, 10);
        const sessionsContainer = document.getElementById('sessions-list');
        
        if (!sessionsContainer) return;

        if (response.sessions.length === 0) {
            sessionsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-clock text-4xl mb-4"></i>
                    <p>Nenhuma sessão de estudo registrada ainda.</p>
                    <p class="text-sm">Use o cronômetro ou adicione manualmente suas horas de estudo!</p>
                </div>
            `;
            return;
        }

        const sessionsHTML = response.sessions.map(session => `
            <div class="session-card bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h4 class="font-semibold text-lg">${session.subject || 'Estudo Geral'}</h4>
                        <p class="text-gray-600">
                            <i class="fas fa-clock mr-1"></i>
                            ${formatDuration(session.durationSeconds)}
                        </p>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            ${formatDate(session.createdAt)}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            +${session.pointsEarned} pts
                        </span>
                        <div class="mt-2">
                            <button onclick="editSession(${session.id})" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteSession(${session.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                ${session.notes ? `
                    <div class="mt-3 p-3 bg-gray-50 rounded">
                        <p class="text-sm text-gray-700">
                            <i class="fas fa-sticky-note mr-1"></i>
                            ${session.notes}
                        </p>
                    </div>
                ` : ''}
            </div>
        `).join('');

        sessionsContainer.innerHTML = sessionsHTML;

        // Mostrar informações de paginação se necessário
        if (response.pagination.totalPages > 1) {
            displayPagination(response.pagination);
        }

    } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        const sessionsContainer = document.getElementById('sessions-list');
        if (sessionsContainer) {
            sessionsContainer.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Erro ao carregar sessões de estudo</p>
                </div>
            `;
        }
    }
}

/**
 * Exclui uma sessão de estudo
 */
async function deleteSession(sessionId) {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) {
        return;
    }

    try {
        await apiClient.deleteStudySession(sessionId);
        showSuccess('Sessão excluída com sucesso');
        await loadStudySessions();
    } catch (error) {
        console.error('Erro ao excluir sessão:', error);
        showError(error.message || 'Erro ao excluir sessão');
    }
}

/**
 * Edita uma sessão de estudo (funcionalidade básica)
 */
async function editSession(sessionId) {
    const newSubject = prompt('Nova matéria:');
    const newNotes = prompt('Novas observações:');
    
    if (newSubject === null) return; // Cancelado

    try {
        await apiClient.updateStudySession(sessionId, {
            subject: newSubject.trim() || null,
            notes: newNotes?.trim() || null
        });
        
        showSuccess('Sessão atualizada com sucesso');
        await loadStudySessions();
    } catch (error) {
        console.error('Erro ao editar sessão:', error);
        showError(error.message || 'Erro ao editar sessão');
    }
}

/**
 * Exibe paginação (implementação básica)
 */
function displayPagination(pagination) {
    // Implementação básica - pode ser expandida conforme necessário
    console.log('Paginação:', pagination);
}

