// js/inicioSesionContencion.js
/**
 * Script para gestionar:
 * - Login / Registro
 * - Olvidé mi contraseña (SweetAlert2)
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Asegurar tab_id único por pestaña
    let tab_id = sessionStorage.getItem("tab_id");
    if (!tab_id) {
        tab_id = crypto.randomUUID();
        sessionStorage.setItem("tab_id", tab_id);
    }

    // 2. Referencias DOM
    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");
    const forgotLink    = document.querySelector(".link-secondary");
    let isLoginMode     = true;

    // 3. Toggle de contraseña
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

    // 4. Montar formularios
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

    // 5. Envío de formulario (login / registro)
    mainForm.addEventListener("submit", async event => {
        event.preventDefault();

        const usuario    = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const nombreFld  = document.getElementById("Nombre");
        const nombre     = nombreFld ? nombreFld.value.trim() : "";

        // Validaciones
        if (!usuario || !contrasena || (!isLoginMode && !nombre)) {
            await Swal.fire("Campos incompletos", "Completa todos los campos obligatorios.", "warning");
            return;
        }
        if (!isLoginMode && usuario.length < 4) {
            await Swal.fire("Usuario muy corto", "Mínimo 4 caracteres.", "error");
            return;
        }
        if (contrasena.length < 6) {
            await Swal.fire("Contraseña inválida", "Mínimo 6 caracteres.", "error");
            return;
        }

        // Preparar fetch
        const formData = new FormData();
        formData.append("Username", usuario);
        formData.append("Contrasena", contrasena);
        formData.append("tab_id", tab_id);
        if (!isLoginMode) formData.append("Nombre", nombre);

        const url = isLoginMode
            ? "dao/validacionUsuarioContencion.php"
            : "dao/registroUsuarioContencion.php";

        try {
            const res  = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();

            if (data.status === "success") {
                await Swal.fire({
                    icon: 'success',
                    title: isLoginMode ? '¡Bienvenido!' : '¡Registrado!',
                    text: data.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                if (isLoginMode) {
                    window.location.href = `dashboardContencion.php?tab_id=${tab_id}`;
                } else {
                    cargarLogin();
                }
            } else {
                await Swal.fire("Error", data.message, "error");
            }
        } catch {
            await Swal.fire("Error de red", "No se pudo conectar al servidor.", "error");
        }
    });

    // 6. Flujo “Olvidé mi contraseña”
    if (forgotLink) {
        forgotLink.addEventListener("click", async ev => {
            ev.preventDefault();

            // Paso 1: pedir SOLO el usuario
            const { value: username } = await Swal.fire({
                title: 'Recuperar contraseña',
                input: 'text',
                inputLabel: 'Nombre de usuario',
                inputPlaceholder: 'Ej. ivancelot9',
                showCancelButton: true
            });
            if (!username) return;

            // Paso 2: pedir el correo al que enviar el token
            const { value: email } = await Swal.fire({
                title: 'Correo de recuperación',
                input: 'email',
                inputLabel: 'Tu correo electrónico',
                inputPlaceholder: 'ejemplo@dominio.com',
                inputValidator: value => {
                    if (!value) return 'Necesitas un correo válido';
                },
                showCancelButton: true
            });
            if (!email) return;

            // Paso 3: solicitar token usando Username + Email
            try {
                const r1 = await fetch(
                    'https://grammermx.com/IvanTest/ContencionMateriales/dao/solicitarToken.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ Username: username, Email: email })
                    }
                );
                const d1 = await r1.json();
                if (d1.status !== 'success') {
                    return Swal.fire('Error', d1.message, 'error');
                }
                await Swal.fire('Token enviado', d1.message, 'success');
            } catch {
                return Swal.fire('Error de red', 'No se pudo enviar el token', 'error');
            }

            // Paso 4: ingresar token y nueva contraseña
            const result = await Swal.fire({
                title: 'Restablecer contraseña',
                html:
                    '<input id="swal-token" class="swal2-input" placeholder="Token">' +
                    '<input id="swal-pass" type="password" class="swal2-input" placeholder="Nueva contraseña">',
                focusConfirm: false,
                preConfirm: () => {
                    const token = document.getElementById('swal-token').value.trim();
                    const pwd   = document.getElementById('swal-pass').value.trim();
                    if (!token || pwd.length < 6) {
                        Swal.showValidationMessage('Token y nueva contraseña (mínimo 6 caracteres) son obligatorios');
                        return;
                    }
                    return { token, pwd };
                }
            });
            if (!result.value) return;
            const { token, pwd } = result.value;

            // Paso 5: enviar al backend para cambiar contraseña
            try {
                const r2 = await fetch(
                    'https://grammermx.com/IvanTest/ContencionMateriales/dao/cambiarContrasena.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            Username: username,
                            Token: token,
                            NuevaContrasena: pwd
                        })
                    }
                );
                const d2 = await r2.json();
                if (d2.status === 'success') {
                    Swal.fire('¡Hecho!', d2.message, 'success');
                } else {
                    Swal.fire('Error', d2.message, 'error');
                }
            } catch {
                Swal.fire('Error de red', 'No se pudo completar la solicitud', 'error');
            }
        });
    }

    // 7. Mostrar login por defecto
    cargarLogin();
});
