import { validarFormulario } from "./validacionesAdmin.js";

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm = document.getElementById("mainForm");

    let isLoginMode = true;

    // 🔁 Función reutilizable para activar el toggle de contraseña
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

    // Cambiar a "Iniciar Sesión"
    loginBtn.addEventListener("click", function () {
        if (!isLoginMode) {
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

            activarTogglePassword(); // ✅ Activar toggle
        }
    });

    // Cambiar a "Registrar"
    registerBtn.addEventListener("click", function () {
        if (isLoginMode) {
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

            activarTogglePassword(); // ✅ Activar toggle
        }
    });

    // Evento que se dispara cuando se envía el formulario
    mainForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Obtener los valores de los campos dinámicos
        const numeroNomina = document.getElementById("NumNomina").value.trim();
        const contrasena = document.getElementById("Contrasena").value.trim();
        const nombre = document.getElementById("Nombre") ? document.getElementById("Nombre").value.trim() : "";

        // Validar el formulario antes de enviarlo
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

        // Crear un objeto FormData para enviar datos al servidor
        const formData = new FormData();
        formData.append("NumNomina", numeroNomina.padStart(8, "0"));
        formData.append("Contrasena", contrasena);
        if (!isLoginMode) {
            formData.append("Nombre", nombre);
        }

        // Enviar datos al servidor mediante fetch
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
});
