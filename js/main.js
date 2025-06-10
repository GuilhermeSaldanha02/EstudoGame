// js/main.js
document.addEventListener("DOMContentLoaded", function() {
    // Lógica para ativar o link de navegação correto
    const currentPage = window.location.pathname.split('/').pop();
    // Alvo agora é a .bottom-nav
    const navLinks = document.querySelectorAll('.bottom-nav .nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();

        if (currentPage === linkPage) {
            link.classList.add('active');
            
            // Troca o ícone para a versão "sólida" (preenchida)
            const icon = link.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            }
        }
    });
});