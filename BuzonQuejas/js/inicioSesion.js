import { validarFormulario } from "./validacionesAdmin.js";

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const dynamicFields = document.getElementById("dynamicFields");
    const mainForm = document.getElementById("mainForm");

    let isLoginMode = true;

    // Crear un mensaje de estado dinámico para validaciones
    let statusMessage = document.createElement("p");
    statusMessage.style.color = "red"; // Inicialmente rojo para advertencias
    statusMessage.style.marginTop = "10px"; // Espaciado superior
    mainForm.appendChild(statusMessage); // Agregar mensaje al formulario

    // Cambiar a "Iniciar Sesión"
    loginBtn.addEventListener("click", function () {
        if (!isLoginMode) {
            isLoginMode = true;
            loginBtn.classList.add("active");
            registerBtn.classList.remove("active");

            dynamicFields.innerHTML = `
                <div class="input-group">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="text" id="NumNomina" placeholder="Número de Nómina" required>
                </div>
                <div class="input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="Contrasena" placeholder="Contraseña" required>
                </div>
            `;
            mainForm.querySelector(".submit-btn").textContent = "Entrar";
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
                    <input type="text" id="NumNomina" placeholder="Número de Nómina" required>
                </div>
                <div class="input-group">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" id="Nombre" placeholder="Nombre" required>
                </div>
                <div class="input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="Contrasena" placeholder="Contraseña" required>
                </div>
            `;
            mainForm.querySelector(".submit-btn").textContent = "Registrar";
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
            statusMessage.textContent = error;
            return;
        }

        statusMessage.textContent = ""; // Sin errores

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
                return response.json(); // Convertir la respuesta a JSONs
            })
            .then((data) => {
                if (data.status === "success") {
                    Swal.fire(
                        isLoginMode ? "¡Inicio exitoso!" : "¡Registro exitoso!",
                        data.message || (isLoginMode ? "Bienvenido de nuevo" : "Cuenta creada correctamente"),
                        "success"
                    ).then(() => {
                        if (isLoginMode) {
                            // Redirigir al usuario al dashboard
                            window.location.href = "dashboardAdmin.php";
                        }
                    });
                } else {
                    statusMessage.textContent = data.message || "Hubo un problema al procesar tu solicitud";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                statusMessage.textContent = "Error en la comunicación con el servidor";
            });
    });
});
