function togglePassword() {
    const passwordField = document.getElementById("password");
    const toggleIcon = document.getElementById("toggleIcon");

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

// Adicionar efeitos de foco nos campos
document.querySelectorAll(".input-field").forEach(field => {
    field.addEventListener("focus", function() {
        this.parentElement.classList.add("focused");
    });

    field.addEventListener("blur", function() {
        this.parentElement.classList.remove("focused");
    });
});

// Simular login (para demonstração)
if (document.querySelector("form")) {
    document.querySelector("form").addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email && password) {
            // Simular carregamento
            const submitBtn = document.querySelector("button[type=\"submit\"]");
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "<i class=\"fas fa-spinner fa-spin mr-2\"></i>Entrando...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert("Login realizado com sucesso! (Esta é apenas uma demonstração)");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
}