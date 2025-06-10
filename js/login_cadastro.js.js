// js/login_cadastro.js (Versão Melhorada - Sem Alerta)

/**
 * Alterna a visibilidade da senha no campo de input.
 */
function togglePassword() {
  const passwordField = document.getElementById("password");
  const toggleIcon = document.getElementById("toggleIcon");

  if (passwordField && toggleIcon) {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  }
}

/**
 * Aguarda o carregamento da página para adicionar o evento de submit ao formulário.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Impede o recarregamento da página

      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");

      // Verifica se os campos foram preenchidos
      if (
        emailInput &&
        passwordInput &&
        emailInput.value &&
        passwordInput.value
      ) {
        const submitBtn = form.querySelector("button[type='submit']");

        // Desabilita o botão e mostra o feedback de carregamento
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...`;

        // Simula um carregamento e depois redireciona
        setTimeout(() => {
          // *** A MÁGICA ACONTECE AQUI: REDIRECIONA DIRETAMENTE ***
          window.location.href = "index.html";
        }, 1500);
      } else {
        alert("Por favor, preencha todos os campos.");
      }
    });
  }
});
