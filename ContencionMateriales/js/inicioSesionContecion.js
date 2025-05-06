// js/inicioSesionContencion.js
/**
 * Gestiona la interfaz de login/registro para el Programa de Contención
 * - Alterna modos (login/registro)
 * - Toggle de visibilidad de contraseña
 * - Validación sencilla de campos
 * - Placeholder para llamada fetch al backend
 */
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");
    let isLoginMode = true;

    function activarTogglePassword() {
        const pwdInput = document.getElementById("contrasena"),
            toggle   = document.getElementById("togglePassword");
        if (pwdInput && toggle) {
            toggle.style.cursor = "pointer";
            toggle.addEventListener("click", () => {
                const tipo = pwdInput.type === "password" ? "text" : "password";
                pwdInput.type = tipo;
                toggle.classList.toggle("fa-eye");
                toggle.classList.toggle("fa-eye-slash");
            });
        }
    }

    function cargarLogin() {
        isLoginMode = true;
        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");
        dynamicFields.innerHTML = `
      <div class="input-group">
        <i class="fa-solid fa-user"></i>
        <input type="text" id="usuario" placeholder="Usuario" required>
      </div>
      <div class="input-group">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="contrasena" placeholder="Contraseña" required>
        <i class="fa-solid fa-eye-slash" id="togglePassword"></i>
      </div>`;
        mainForm.querySelector(".submit-btn").textContent = "Entrar";
        activarTogglePassword();
    }

    function cargarRegistro() {
        isLoginMode = false;
        registerBtn.classList.add("active");
        loginBtn.classList.remove("active");
        dynamicFields.innerHTML = `
      <div class="input-group">
        <i class="fa-solid fa-user"></i>
        <input type="text" id="usuario" placeholder="Usuario" required>
      </div>
      <div class="input-group">
        <i class="fa-solid fa-id-badge"></i>
        <input type="text" id="Nombre" placeholder="Nombre" required>
      </div>
      <div class="input-group">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="contrasena" placeholder="Contraseña" required>
        <i class="fa-solid fa-eye-slash" id="togglePassword"></i>
      </div>`;
        mainForm.querySelector(".submit-btn").textContent = "Registrar";
        activarTogglePassword();
    }

    loginBtn.addEventListener("click", cargarLogin);
    registerBtn.addEventListener("click", cargarRegistro);

    mainForm.addEventListener("submit", event => {
        event.preventDefault();
        const usuario    = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const nombreFld  = document.getElementById("Nombre");
        const nombre     = nombreFld ? nombreFld.value.trim() : "";

        if (!usuario || !contrasena || (!isLoginMode && !nombre)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos.'
            });
            return;
        }

        // TODO: fetch al backend
        console.log({usuario, contrasena, nombre, modo: isLoginMode?'login':'registro'});
        Swal.fire({
            icon: 'info',
            title: 'Función pendiente',
            text: 'Aquí se enviará la información al servidor.'
        });
    });

    cargarLogin();
});
