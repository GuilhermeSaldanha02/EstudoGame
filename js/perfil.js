document.addEventListener('DOMContentLoaded', () => {
    // 1. Dados Falsos (Mock Data)
    const userData = {
        nome: "Ricardo Almeida",
        avatarUrl: "https://via.placeholder.com/150", // Substitua por uma URL real se quiser
        stats: {
            questoes: 152,
            desafios: 12,
            horas: 48
        }
    };

    // 2. Função para carregar os dados na página
    function carregarPerfil(user) {
        const profileName = document.getElementById('profile-name');
        const profileAvatar = document.getElementById('profile-avatar');
        const statsQuestoes = document.getElementById('stats-questoes');
        const statsDesafios = document.getElementById('stats-desafios');
        const statsHoras = document.getElementById('stats-horas');
        
        if(profileName) profileName.textContent = user.nome;
        if(profileAvatar) profileAvatar.src = user.avatarUrl;
        if(statsQuestoes) statsQuestoes.textContent = user.stats.questoes;
        if(statsDesafios) statsDesafios.textContent = user.stats.desafios;
        if(statsHoras) statsHoras.textContent = user.stats.horas;
    }

    // 3. Chamar a função
    carregarPerfil(userData);
});