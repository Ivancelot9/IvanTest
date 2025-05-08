// js/inicioSesionContencion.js
/**
 * Script para gestionar el inicio de sesión y registro en el sistema de Contención.
 * - Alterna entre Login y Registro dinámicamente.
 * - Muestra/Oculta la contraseña con un icono de ojo.
 * - Valida campos antes de enviar.
 * - Realiza fetch a los endpoints PHP correspondientes.
 * - Redirige al dashboard si el inicio de sesión es exitoso.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ✅ 1. Asegurar tab_id único por pestaña
    if (!sessionStorage.getItem("tab_id")) {
        const nuevoTabId = crypto.randomUUID();
        sessionStorage.setItem("tab_id", nuevoTabId);
    }
    const tab_id = sessionStorage.getItem("tab_id");

    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");

    let isLoginMode = true; // Estado actual del modo

    // ✅ 2. Activar toggle para ver contraseña
    function activarTogglePassword() {
        const pwdInput = document.getElementById("contrasena");
        const toggle   = document.getElementById("togglePassword");
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

    // ✅ 3. Cargar formulario de Login
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

    // ✅ 4. Cargar formulario de Registro
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
                <input type="text" id="Nombre" placeholder="Nombre completo" required>
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

    // ✅ 5. Enviar formulario
    mainForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username   = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const nombreFld  = document.getElementById("Nombre");
        const nombre     = nombreFld ? nombreFld.value.trim() : "";

        // 🛡️ Validación de campos
        if (!username || !contrasena || (!isLoginMode && !nombre)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos obligatorios.'
            });
            return;
        }

        if (!isLoginMode && username.length < 4) {
            Swal.fire({
                icon: 'error',
                title: 'Usuario muy corto',
                text: 'El nombre de usuario debe tener al menos 4 caracteres.'
            });
            return;
        }

        if (contrasena.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña inválida',
                text: 'La contraseña debe tener al menos 6 caracteres.'
            });
            return;
        }

        // 📨 Preparar datos para envío
        const formData = new FormData();
        formData.append("Username", username);
        formData.append("Contrasena", contrasena);
        formData.append("tab_id", tab_id);
        if (!isLoginMode) formData.append("Nombre", nombre);

        const url = isLoginMode
            ? "dao/validacionUsuarioContencion.php"
            : "dao/registroUsuarioContencion.php";

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: isLoginMode ? '¡Bienvenido!' : '¡Registrado!',
                    text: data.message,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    if (isLoginMode) {
                        // Redirigir al dashboard de contención
                        window.location.href = `dashboardContencion.php?tab_id=${tab_id}`;
                    } else {
                        cargarLogin();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || "Hubo un problema al procesar tu solicitud."
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo conectar al servidor.'
            });
            console.error("Error de red:", error);
        }
    });

    // ✅ 6. Mostrar login por defecto
    cargarLogin();
});
