document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    let timerInterval = null;
    let seconds = 0; // Começa de 0, pode ser alterado para um valor inicial ex: 1500 para 25min

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function updateDisplay() {
        timerDisplay.textContent = formatTime(seconds);
    }

    function startTimer() {
        if (timerInterval) return; // Não inicia se já estiver rodando
        timerInterval = setInterval(() => {
            seconds++;
            updateDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function resetTimer() {
        pauseTimer();
        seconds = 0;
        updateDisplay();
    }

    // Event Listeners
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    // Initial display
    updateDisplay();
});