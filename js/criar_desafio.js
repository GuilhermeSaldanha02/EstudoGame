document.addEventListener('DOMContentLoaded', () => {
    const challengeForm = document.getElementById('challenge-form');

    if (challengeForm) {
        challengeForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nomeDesafio = document.getElementById('nome_desafio').value;
            const materia = document.getElementById('materia').value;

            if (!nomeDesafio || !materia) {
                alert('Por favor, preencha pelo menos o Nome do Desafio e a Matéria.');
                return;
            }

            const novoDesafio = {
                nome: nomeDesafio,
                materia: materia,
                criadoEm: new Date().toISOString()
            };

            console.log('Desafio Criado:', novoDesafio);
            alert(`Desafio "${novoDesafio.nome}" criado com sucesso!`);
            
            challengeForm.reset();
        });
    }
});