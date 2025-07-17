/**
 ===============================================================================
 @file       inicioSesionContecion.js
 @project    Programa de Contención de Materiales
 @module     Autenticación de Usuarios
 @purpose    Gestiona el inicio de sesión, registro y recuperación de contraseña.
 @description
 Este script controla el comportamiento dinámico del formulario de autenticación.
 Permite cambiar entre los modos de login y registro, validar campos, manejar
 errores, enviar datos al backend mediante `fetch` y mostrar mensajes interactivos
 con SweetAlert2. Además, implementa un flujo completo de recuperación de contraseña
 con envío de token por correo y verificación cronometrada.

 ➤ Controla dinámicamente el formulario en login.html
 ➤ Usa SweetAlert2 para mostrar formularios y alertas interactivas
 ➤ Enlaza con los archivos PHP ubicados en la carpeta /dao:
 - validacionUsuarioContencion.php
 - registroUsuarioContencion.php
 - solicitarToken.php
 - cambiarContrasena.php
 ➤ Asocia un tab_id único a cada pestaña para identificar sesiones por pestaña
 ➤ Tras un login exitoso, redirige automáticamente a: dashboardContencion.php?tab_id=...

 @author     Ivan Medina/Hadbet Altamirano
 @created    Mayo 2025
 @updated    [¿?]
  ===============================================================================
 */

// Espera a que todo el DOM esté listo para ejecutar la lógica
document.addEventListener("DOMContentLoaded", () => {

    // 1. Asigna un ID único por pestaña para identificar la sesión actual
    let tab_id = sessionStorage.getItem("tab_id");
    if (!tab_id) {
        tab_id = crypto.randomUUID();
        sessionStorage.setItem("tab_id", tab_id);
    }

    // 2. Obtiene referencias clave del DOM
    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");
    const forgotLink    = document.querySelector(".link-secondary");
    let isLoginMode     = true; // Controla si estamos en login o registro

    /**
     * 3. Activa el botón de mostrar/ocultar contraseña
     */
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

    /**
     * 4. Genera el formulario de inicio de sesión dinámicamente
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
                <i class="fa-solid fa-eye-slash" id="togglePassword"></i>
            </div>`;
        mainForm.querySelector(".submit-btn").textContent = "Entrar";
        activarTogglePassword();
    }

    /**
     * 5. Genera el formulario de registro dinámicamente
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

    // 6. Cambia entre login y registro al hacer clic
    loginBtn.addEventListener("click", cargarLogin);
    registerBtn.addEventListener("click", cargarRegistro);

    /**
     * 7. Manejador del envío del formulario (login o registro)
     */
    mainForm.addEventListener("submit", async event => {
        event.preventDefault();

        const usuario    = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const nombreFld  = document.getElementById("Nombre");
        const nombre     = nombreFld ? nombreFld.value.trim() : "";

        // Validaciones básicas
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

        // Preparación del envío
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

    /**
     * 8. Flujo de recuperación de contraseña con token
     */
    if (forgotLink) {
        forgotLink.addEventListener("click", async ev => {
            ev.preventDefault();

            // Paso 1: Solicita el nombre de usuario
            const { value: username } = await Swal.fire({
                title: 'Recuperar contraseña',
                input: 'text',
                inputLabel: 'Nombre de usuario',
                inputPlaceholder: 'Ej. ivancelot9',
                showCancelButton: true
            });
            if (!username) return;

            // Paso 2: Solicita el correo electrónico
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

            // Paso 3: Solicita token al servidor
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
                    await Swal.fire('Error', d1.message, 'error');
                    return;
                }

                await Swal.fire('Token enviado', d1.message, 'success');
            } catch {
                return Swal.fire('Error de red', 'No se pudo enviar el token', 'error');
            }

            // Paso 4: Formulario para token + nueva contraseña con temporizador
            const timerInterval = 600; // 10 minutos
            let remainingSeconds = timerInterval;

            const result = await Swal.fire({
                title: 'Restablecer contraseña',
                html:
                    '<input id="swal-token" class="swal2-input" placeholder="Token">' +
                    '<input id="swal-pass" type="password" class="swal2-input" placeholder="Nueva contraseña">' +
                    `<p style="margin-top:10px;font-size:14px;">Este token expira en <span id="countdown">10:00</span> minutos.</p>`,
                timer: timerInterval * 1000,
                timerProgressBar: true,
                didOpen: () => {
                    const countdown = Swal.getPopup().querySelector('#countdown');
                    const interval = setInterval(() => {
                        if (remainingSeconds <= 0) {
                            clearInterval(interval);
                            return;
                        }
                        remainingSeconds--;
                        const minutes = Math.floor(remainingSeconds / 60);
                        const seconds = remainingSeconds % 60;
                        countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    }, 1000);
                    Swal.stopTimer(); // Desactiva cierre automático
                },
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

            // Paso 5: Enviar al servidor para cambio de contraseña
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

    // 9. Carga el modo login por defecto al cargar la página
    cargarLogin();
});
