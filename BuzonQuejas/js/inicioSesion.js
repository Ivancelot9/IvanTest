import { validarFormulario } from "./validacionesAdmin.js";

document.addEventListener("DOMContentLoaded", function () {
    // ✅ Paso 1: Generar tab_id único por pestaña
    if (!sessionStorage.getItem("tab_id")) {
        const nuevoTabId = crypto.randomUUID();
        sessionStorage.setItem("tab_id", nuevoTabId);
    }
    const tab_id = sessionStorage.getItem("tab_id");

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm = document.getElementById("mainForm");

    let isLoginMode = true;

    function activarTogglePassword() {
        const inputPwd = document.getElementById("Contrasena");
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

    loginBtn.addEventListener("click", cargarLogin);
    registerBtn.addEventListener("click", cargarRegistro);

    mainForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // 1) Leo los valores que ingresó el usuario (4 o 5 dígitos)
        const rawNomina = document.getElementById("NumNomina").value.trim();
        const contrasena = document.getElementById("Contrasena").value.trim();
        const nombre = document.getElementById("Nombre")
            ? document.getElementById("Nombre").value.trim()
            : "";

        // 2) Validación front-end
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

        // 3) Internamente relleno a 5 dígitos sin alterar el input
        const nom5 = rawNomina.padStart(5, "0");
        // 4) Luego relleno a 8 para enviar al back-end
        const nom8 = nom5.padStart(8, "0");

        // 5) Preparo FormData
        const formData = new FormData();
        formData.append("NumNomina", nom8);
        formData.append("Contrasena", contrasena);
        formData.append("tab_id", tab_id);
        if (!isLoginMode) {
            formData.append("Nombre", nombre);
        }

        const url = isLoginMode
            ? "https://grammermx.com/IvanTest/BuzonQuejas/dao/validacionAdmin.php"
            : "https://grammermx.com/IvanTest/BuzonQuejas/dao/registroAdmin.php";

        fetch(url, {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    Swal.fire(
                        isLoginMode ? "¡Inicio exitoso!" : "¡Registro exitoso!",
                        data.message || (isLoginMode ? "Bienvenido de nuevo" : "Cuenta creada correctamente"),
                        "success"
                    ).then(() => {
                        if (isLoginMode) {
                            window.location.href = "dashboardAdmin.php";
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
            .catch((error) => {
                console.error("Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Error en la comunicación con el servidor"
                });
            });
    });

    cargarLogin();
});
