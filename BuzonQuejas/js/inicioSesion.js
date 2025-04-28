/* --- JS: js/inicioSesion.js --- */
/**
 * @file inicioSesion.js
 * @description
 * Gestiona la interfaz de inicio de sesión y registro de administradores:
 *  1. Genera un identificador único de pestaña (tab_id).
 *  2. Alterna entre modos «Entrar» y «Registrar» modificando dinámicamente los campos del formulario.
 *  3. Activa la visibilidad de la contraseña con un toggle de ojo.
 *  4. Valida la entrada del usuario usando `validarFormulario`.
 *  5. Completa y ajusta el número de nómina antes de enviarlo al servidor.
 *  6. Envía los datos al endpoint apropiado (login o registro) y procesa la respuesta.
 *  7. Redirige o muestra mensajes de éxito/error con SweetAlert2.
 *
 * Requiere:
 *  - Módulo `validarFormulario` de "./validacionesAdmin.js".
 *  - SweetAlert2 (`Swal`) disponible globalmente.
 *  - Elementos en el DOM con los IDs:
 *      • "loginBtn", "registerBtn"
 *      • "dynamicFields", "mainForm"
 *  - Inputs generados dinámicamente con IDs:
 *      • "NumNomina", "Contrasena", "Nombre"
 *  - Endpoints:
 *      • POST "dao/validacionAdmin.php"
 *      • POST "dao/registroAdmin.php"
 */

import { validarFormulario } from "./validacionesAdmin.js";

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Generar y almacenar tab_id en sessionStorage
    ───────────────────────────────────────── */
    if (!sessionStorage.getItem("tab_id")) {
        const nuevoTabId = crypto.randomUUID();
        sessionStorage.setItem("tab_id", nuevoTabId);
    }
    const tab_id = sessionStorage.getItem("tab_id");

    /* ─────────────────────────────────────────
       2. Referencias a botones y contenedores del formulario
    ───────────────────────────────────────── */
    const loginBtn      = document.getElementById("loginBtn");
    const registerBtn   = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm      = document.getElementById("mainForm");

    // Modo actual: true = Login, false = Registro
    let isLoginMode = true;

    /* ─────────────────────────────────────────
       3. Toggle para mostrar/ocultar contraseña
    ───────────────────────────────────────── */
    function activarTogglePassword() {
        const inputPwd  = document.getElementById("Contrasena");
        const togglePwd = document.getElementById("togglePassword");
        if (inputPwd && togglePwd) {
            togglePwd.addEventListener("click", () => {
                const isPwd = inputPwd.type === "password";
                inputPwd.type = isPwd ? "text" : "password";
                togglePwd.classList.toggle("fa-eye");
                togglePwd.classList.toggle("fa-eye-slash");
            });
        }
    }

    /* ─────────────────────────────────────────
       4. Cargar interfaz de Login
    ───────────────────────────────────────── */
    function cargarLogin() {
        isLoginMode = true;
        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");

        dynamicFields.innerHTML = `
            <div class="input-group">
                <i class="fa-solid fa-envelope"></i>
                <input type="text" id="NumNomina" placeholder="Número de Nómina">
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="Contrasena" placeholder="Contraseña" autocomplete="new-password">
                <i class="fa-solid fa-eye" id="togglePassword" style="cursor:pointer;margin-left:10px;"></i>
            </div>
        `;
        mainForm.querySelector(".submit-btn").textContent = "Entrar";

        activarTogglePassword();
    }

    /* ─────────────────────────────────────────
       5. Cargar interfaz de Registro
    ───────────────────────────────────────── */
    function cargarRegistro() {
        isLoginMode = false;
        registerBtn.classList.add("active");
        loginBtn.classList.remove("active");

        dynamicFields.innerHTML = `
            <div class="input-group">
                <i class="fa-solid fa-envelope"></i>
                <input type="text" id="NumNomina" placeholder="Número de Nómina">
            </div>
            <div class="input-group">
                <i class="fa-solid fa-user"></i>
                <input type="text" id="Nombre" placeholder="Nombre">
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="Contrasena" placeholder="Contraseña" autocomplete="new-password">
                <i class="fa-solid fa-eye" id="togglePassword" style="cursor:pointer;margin-left:10px;"></i>
            </div>
        `;
        mainForm.querySelector(".submit-btn").textContent = "Registrar";

        activarTogglePassword();
    }

    // Alternar modos al hacer clic en los botones
    loginBtn.addEventListener("click", cargarLogin);
    registerBtn.addEventListener("click", cargarRegistro);

    /* ─────────────────────────────────────────
       6. Manejador de envío de formulario
    ───────────────────────────────────────── */
    mainForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // 6.1 Leer valores ingresados
        const rawNomina  = document.getElementById("NumNomina").value.trim();
        const contrasena = document.getElementById("Contrasena").value.trim();
        const nombre     = document.getElementById("Nombre")
            ? document.getElementById("Nombre").value.trim()
            : "";

        // 6.2 Validación front-end
        const error = validarFormulario({ numeroNomina: rawNomina, contrasena, nombre, isLoginMode });
        if (error) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos inválidos',
                html: error,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // 6.3 Relleno de nómina a 5 y luego a 8 dígitos
        const nom5 = rawNomina.padStart(5, "0");
        const nom8 = nom5.padStart(8, "0");

        // 6.4 Preparar FormData para envío
        const formData = new FormData();
        formData.append("NumNomina", nom8);
        formData.append("Contrasena", contrasena);
        formData.append("tab_id", tab_id);
        if (!isLoginMode) {
            formData.append("Nombre", nombre);
        }

        // 6.5 Definir URL según modo
        const url = isLoginMode
            ? "https://grammermx.com/IvanTest/BuzonQuejas/dao/validacionAdmin.php"
            : "https://grammermx.com/IvanTest/BuzonQuejas/dao/registroAdmin.php";

        // 6.6 Enviar petición al servidor
        fetch(url, { method: "POST", body: formData })
            .then(response => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    Swal.fire(
                        isLoginMode ? "¡Inicio exitoso!" : "¡Registro exitoso!",
                        data.message || (isLoginMode ? "Bienvenido de nuevo" : "Cuenta creada correctamente"),
                        "success"
                    ).then(() => {
                        if (isLoginMode) {
                            window.location.href = "dashboardAdmin.php?tab_id=" + tab_id;
                        } else {
                            cargarLogin();
                        }
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || "Hubo un problema al procesar tu solicitud"
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Error en la comunicación con el servidor"
                });
            });
    });

    /* ─────────────────────────────────────────
       7. Inicializar vista en modo Login
    ───────────────────────────────────────── */
    cargarLogin();
});
