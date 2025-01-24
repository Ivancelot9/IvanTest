import { validarCamposComunes, validarNombre } from "./validacionesAdmin.js";
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

        // Validar el formulario antes de enviarlo
        if (!validarFormulario()) return;

        // Obtener los campos dinámicos según el modo
        const inputNomina = document.getElementById("NumNomina");
        const inputContrasena = document.getElementById("Contrasena");
        const inputNombre = document.getElementById("Nombre"); // Sólo estará disponible en modo Registro

        // Crear un objeto FormData para enviar datos al servidor
        const formData = new FormData();
        formData.append("NumNomina", inputNomina.value.trim().padStart(8, "0")); // Número de Nómina
        formData.append("Contrasena", inputContrasena.value.trim()); // Contraseña
        if (!isLoginMode) {
            formData.append("Nombre", inputNombre.value.trim()); // Nombre (solo en modo Registro)
        }

        // Enviar datos al servidor mediante fetch
        const  url = isLoginMode
            ? "https://grammermx.com/IvanTest/BuzonQuejas/dao/validacionAdmin.php"
            : "https://grammermx.com/IvanTest/BuzonQuejas/dao/registroAdmin.php"
        fetch( url, {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json(); // Convertir la respuesta a JSON
            })
            .then((data) => {
                if (data.status === "success") {
                    // Mostrar mensaje de éxito
                    Swal.fire(
                        isLoginMode ? "¡Inicio exitoso!" : "¡Registro exitoso!",
                        data.message || (isLoginMode ? "Bienvenido de nuevo" : "Cuenta creada correctamente"),
                        "success"
                    );
                } else {
                    // Mostrar mensaje de error
                    statusMessage.textContent = data.message || "Hubo un problema al procesar tu solicitud";
                }
            })
            .catch((error) => {
                // Manejar errores de red o del servidor
                console.error("Error:", error);
                statusMessage.textContent = "Error en la comunicación con el servidor";
            });
    });

         function validarFormulario() {
             const inputNomina = document.getElementById("NumNomina");
             const inputContrasena = document.getElementById("Contrasena");
             const inputNombre = document.getElementById("Nombre");

             const numeroNomina = inputNomina.value.trim();
             const contrasena = inputContrasena.value.trim();
             const nombre = inputNombre ? inputNombre.value.trim() : "";

             // Validar campos comunes
             const errorCamposComunes = validarCamposComunes(numeroNomina, contrasena);
             if (errorCamposComunes) {
                 statusMessage.textContent = errorCamposComunes;
                 return false;
             }

             // Validar el nombre solo si está en modo registro
             if (!isLoginMode) {
                 const errorNombre = validarNombre(nombre);
                 if (errorNombre) {
                     statusMessage.textContent = errorNombre;
                     return false;
                 }
             }

             statusMessage.textContent = ""; // Sin errores
             return true;
         }


});