/* --- JS: js/inicioSesionContencion.js --- */
/**
 * @file inicioSesionContencion.js
 * @description
 * Gestiona la interfaz de inicio de sesión y registro para el "Programa de Contención":
 *  1. Alterna entre modos «Entrar» y «Registrar» cambiando los campos del formulario.
 *  2. Activa el toggle de visibilidad de contraseña.
 *  3. Valida que los campos no estén vacíos.
 *  4. Deja un placeholder para la llamada Fetch/AJAX al backend.
 *
 * Requiere:
 *  - SweetAlert2 (`Swal`) disponible globalmente.
 *  - Elementos en el DOM con los IDs: "loginBtn", "registerBtn", "dynamicFields", "mainForm".
 *  - Inputs dinámicos con IDs: "usuario", "contrasena", "Nombre" (solo en registro).
 */

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a botones y contenedor dinámico
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm = document.getElementById("mainForm");

    // Estado: true = login, false = registro
    let isLoginMode = true;

    /**
     * Activa el icono de ojo para mostrar/ocultar contraseña
     */
    function activarTogglePassword() {
        const pwdInput = document.getElementById("contrasena");
        const toggle = document.getElementById("togglePassword");
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

    /**
     * Carga campos para Login
     */
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
        <i class="fa-solid fa-eye-slash" id="togglePassword" style="margin-left:8px;"></i>
      </div>
    `;
        mainForm.querySelector(".submit-btn").textContent = "Entrar";
        activarTogglePassword();
    }

    /**
     * Carga campos para Registro
     */
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
        <i class="fa-solid fa-eye-slash" id="togglePassword" style="margin-left:8px;"></i>
      </div>
    `;
        mainForm.querySelector(".submit-btn").textContent = "Registrar";
        activarTogglePassword();
    }

    // Listeners para alternar modos
    loginBtn.addEventListener("click", cargarLogin);
    registerBtn.addEventListener("click", cargarRegistro);

    // Envío de formulario
    mainForm.addEventListener("submit", (event) => {
        event.preventDefault();
        // Leer valores
        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const nombreField = document.getElementById("Nombre");
        const nombre = nombreField ? nombreField.value.trim() : null;

        // Validación simple
        if (!usuario || !contrasena || (!isLoginMode && !nombre)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos.'
            });
            return;
        }

        // TODO: Implementar llamadas Fetch/AJAX a tu backend
        /* Ejemplo:
        const url = isLoginMode ? '/api/login' : '/api/registro';
        fetch(url, {
          method: 'POST',
          body: JSON.stringify({ usuario, contrasena, nombre }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => { ... })
        .catch(err => { ... });
        */

        console.log('Enviando formulario:', { usuario, contrasena, nombre, modo: isLoginMode ? 'login' : 'registro' });
        Swal.fire({
            icon: 'info',
            title: 'Función pendiente',
            text: 'Aquí se enviará la información al servidor cuando esté listo.'
        });
    });

    // Inicializar en modo Login
    cargarLogin();
});
