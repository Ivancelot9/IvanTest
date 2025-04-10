import { validarFormulario } from "./validacionesAdmin.js";

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm = document.getElementById("mainForm");

    let isLoginMode = true;

    function agregarTogglePassword() {
        const passwordInput = document.getElementById("Contrasena");

        // Elimina cualquier ícono duplicado
        const inputGroup = passwordInput.closest(".input-group");
        const oldToggle = inputGroup.querySelector(".toggle-password");
        if (oldToggle) oldToggle.remove();

        // Crear nuevo ícono
        const toggleIcon = document.createElement("i");
        toggleIcon.classList.add("fa-solid", "fa-eye", "toggle-password");
        toggleIcon.style.cursor = "pointer";
        toggleIcon.style.marginLeft = "auto";

        inputGroup.appendChild(toggleIcon);

        toggleIcon.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleIcon.classList.toggle("fa-eye");
            toggleIcon.classList.toggle("fa-eye-slash");
        });
    }

    function actualizarCamposHTML(html, submitText) {
        dynamicFields.innerHTML = html;
        mainForm.querySelector(".submit-btn").textContent = submitText;
        setTimeout(agregarTogglePassword, 0);
    }

    loginBtn.addEventListener("click", () => {
        if (!isLoginMode) {
            isLoginMode = true;
            loginBtn.classList.add("active");
            registerBtn.classList.remove("active");

            actualizarCamposHTML(`
                <div class="input-group">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="text" id="NumNomina" placeholder="Número de Nómina">
                </div>
                <div class="input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="Contrasena" placeholder="Contraseña">
                </div>
            `, "Entrar");
        }
    });

    registerBtn.addEventListener("click", () => {
        if (isLoginMode) {
            isLoginMode = false;
            registerBtn.classList.add("active");
            loginBtn.classList.remove("active");

            actualizarCamposHTML(`
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
                    <input type="password" id="Contrasena" placeholder="Contraseña">
                </div>
            `, "Registrar");
        }
    });

    mainForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const numeroNomina = document.getElementById("NumNomina").value.trim();
        const contrasena = document.getElementById("Contrasena").value.trim();
        const nombre = document.getElementById("Nombre") ? document.getElementById("Nombre").value.trim() : "";

        const error = validarFormulario({ numeroNomina, contrasena, nombre, isLoginMode });

        if (error) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos inválidos',
                html: error,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const formData = new FormData();
        formData.append("NumNomina", numeroNomina.padStart(8, "0"));
        formData.append("Contrasena", contrasena);
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

    setTimeout(agregarTogglePassword, 0);
});
