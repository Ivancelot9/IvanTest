// js/inicioSesionContencion.js
/**
 * Script para gestionar el inicio de sesión y registro en el sistema de Contención.
 * - Alterna entre Login y Registro dinámicamente.
 * - Muestra/Oculta la contraseña con un icono de ojo.
 * - Valida campos antes de enviar.
 * - Realiza fetch a los endpoints PHP correspondientes.
 * - Redirige al dashboard si el inicio de sesión es exitoso.
 *  * - Flujo de “Olvidé mi contraseña” con SweetAlert2.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ✅ 1. Asegurar un único tab_id por pestaña
    let tab_id = sessionStorage.getItem("tab_id");
    if (!tab_id) {
        tab_id = crypto.randomUUID();
        sessionStorage.setItem("tab_id", tab_id);
    }

    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");
    let isLoginMode     = true;

    // ✅ 2. Toggle de visibilidad de contraseña
    function activarTogglePassword() {
        const pwdInput = document.getElementById("contrasena");
        const toggle   = document.getElementById("togglePassword");
        if (pwdInput && toggle) {
            toggle.style.cursor = "pointer";
            toggle.addEventListener("click", () => {
                pwdInput.type = pwdInput.type === "password" ? "text" : "password";
                toggle.classList.toggle("fa-eye");
                toggle.classList.toggle("fa-eye-slash");
            });
        }
    }

    // ✅ 3. Formulario de Login
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

    // ✅ 4. Formulario de Registro
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

        // 🛡️ Validaciones de entrada
        if (!username || !contrasena || (!isLoginMode && !nombre)) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa todos los campos obligatorios.' });
            return;
        }
        if (!isLoginMode && username.length < 4) {
            Swal.fire({ icon: 'error', title: 'Usuario muy corto', text: 'El nombre de usuario debe tener al menos 4 caracteres.' });
            return;
        }
        if (contrasena.length < 6) {
            Swal.fire({ icon: 'error', title: 'Contraseña inválida', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        if (!username || !contrasena || (!isLoginMode && !nombre)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos obligatorios.'
            });
            return;
        }

        // 📦 Preparar datos y endpoint
        const formData = new FormData();
        formData.append("Username", username);
        formData.append("Contrasena", contrasena);
        formData.append("tab_id", tab_id);
        if (!isLoginMode) formData.append("Nombre", nombre);

        const url = isLoginMode
            ? "dao/validacionUsuarioContencion.php"
            : "dao/registroUsuarioContencion.php";

        // 🚀 Enviar al servidor
        try {
            const response = await fetch(url, { method: "POST", body: formData });
            const data = await response.json();

            if (data.status === "success") {
                Swal.fire({ icon: 'success', title: isLoginMode ? '¡Bienvenido!' : '¡Registrado!', text: data.message, timer: 1500, showConfirmButton: false })
                    .then(() => {
                        if (isLoginMode) {
                            window.location.href = `dashboardContencion.php?tab_id=${tab_id}`;
                        } else {
                            cargarLogin();
                        }
                    });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Hubo un problema al procesar tu solicitud.' });
            }
        } catch (error) {
            console.error("Error de red:", error);
            Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar al servidor.' });
        }
    });

    // 5. Flujo “Olvidé mi contraseña”
    forgotLink.addEventListener("click", async e => {
        e.preventDefault();

        // Paso 1: pedir usuario o email
        const { value: user } = await Swal.fire({
            title: 'Recuperar contraseña',
            input: 'text',
            inputLabel: 'Usuario o correo',
            inputPlaceholder: 'Ingresa tu usuario o email',
            showCancelButton: true
        });
        if (!user) return;

        // Paso 2: solicitar token al backend
        try {
            const r1 = await fetch('dao/solicitarToken.php', {
                method: 'POST',
                body: new URLSearchParams({ Username: user })
            });
            const d1 = await r1.json();
            if (d1.status !== 'success') {
                return Swal.fire('Error', d1.message, 'error');
            }
            await Swal.fire('Token enviado', 'Revisa tu correo para el token', 'success');
        } catch (err) {
            console.error(err);
            return Swal.fire('Error de red', 'No se pudo enviar el token', 'error');
        }

        // Paso 3: pedir token + nueva contraseña
        const { value: formValues } = await Swal.fire({
            title: 'Ingresa token y nueva contraseña',
            html:
                '<input id="swal-token" class="swal2-input" placeholder="Token">'+
                '<input id="swal-pass" type="password" class="swal2-input" placeholder="Nueva contraseña">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    token: document.getElementById('swal-token').value,
                    pwd:   document.getElementById('swal-pass').value
                };
            }
        });
        if (!formValues || !formValues.token || formValues.pwd.length < 6) {
            return Swal.fire('Error', 'Completa todos los campos correctamente', 'error');
        }

        // Paso 4: enviar al backend para resetear
        try {
            const r2 = await fetch('dao/cambiarContrasena.php', {
                method: 'POST',
                body: new URLSearchParams({
                    Username: user,
                    Token: formValues.token,
                    NuevaContrasena: formValues.pwd
                })
            });
            const d2 = await r2.json();
            if (d2.status === 'success') {
                Swal.fire('¡Hecho!', d2.message, 'success');
            } else {
                Swal.fire('Error', d2.message, 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error de red', 'No se pudo completar la solicitud', 'error');
        }
    });


    // ✅ 6. Mostrar Login por defecto
    cargarLogin();
});
