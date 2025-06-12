/**
 * Alterna a visibilidade da senha em um campo específico.
 * @param {string} fieldId - O ID do campo de input (ex: 'password').
 * @param {string} iconId - O ID do ícone <i> (ex: 'toggleIcon').
 */
function togglePasswordVisibility(fieldId, iconId) {
  const passwordField = document.getElementById(fieldId);
  const toggleIcon = document.getElementById(iconId);

  // Verifica se ambos os elementos existem antes de continuar
  if (passwordField && toggleIcon) {
    // Se o campo for do tipo 'password', muda para 'text' e troca o ícone
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      // Senão, volta para 'password' e troca o ícone de volta
      passwordField.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  }
}

/**
 * Aguarda o carregamento da página para adicionar eventos.
 */
document.addEventListener("DOMContentLoaded", () => {
  // ATENÇÃO: apiClient.isAuthenticated() precisa ser implementado no seu api-client.js
  // para verificar se existe um token válido no localStorage, por exemplo.
  if (typeof apiClient !== 'undefined' && apiClient.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  // Formulário de Login
  const loginForm = document.querySelector("form");
  if (loginForm && window.location.pathname.includes('login')) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Formulário de Cadastro
  const registerForm = document.querySelector("form");
  if (registerForm && window.location.pathname.includes('cadastro')) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

/**
 * Manipula o login do usuário
 */
async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = event.target.querySelector("button[type='submit']");

  // Validação básica
  if (!emailInput?.value || !passwordInput?.value) {
    showError("Por favor, preencha todos os campos.");
    return;
  }

  // Desabilitar botão e mostrar loading
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...`;

  try {
    // Supondo que o apiClient.login salva o token no localStorage
    const response = await apiClient.login({
      email: emailInput.value,
      password: passwordInput.value
    });

    showSuccess("Login realizado com sucesso!");
    
    // Redirecionar após um breve delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    showError(error.message || "Erro ao fazer login. Verifique suas credenciais.");
    
    // Restaurar botão
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/**
 * Manipula o cadastro do usuário
 */
async function handleRegister(event) {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = event.target.querySelector("button[type='submit']");

  // Validação básica
  if (!nameInput?.value || !emailInput?.value || !passwordInput?.value) {
    showError("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (passwordInput.value.length < 6) {
    showError("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  if (confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
    showError("As senhas não coincidem.");
    return;
  }

  // Desabilitar botão e mostrar loading
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Cadastrando...`;

  try {
    const response = await apiClient.register({
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value
    });

    // --- CÓDIGO AJUSTADO ---
    // 1. Mensagem de sucesso mais informativa.
    showSuccess("Cadastro realizado com sucesso! Por favor, faça o login.");
    
    // 2. Redireciona para a página de LOGIN após 2 segundos.
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

  } catch (error) {
    showError(error.message || "Erro ao criar conta. Tente novamente.");
    
    // Restaurar botão
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}