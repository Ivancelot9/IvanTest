// Espera a que el contenido de la página esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Referencias a los elementos del formulario
    const inputNombre = document.getElementById("Nombre"); // Campo de nombre
    const inputNomina = document.getElementById("NumNomina"); // Campo de número de nómina
    const inputContrasena = document.getElementById("Contrasena"); // Campo de contraseña
    const formulario = document.getElementById("formularioRegistro"); // Formulario principal

    const nameGroup = document.getElementById("nameGroup"); // Grupo del campo de nombre
    const title = document.getElementById("title"); // Título del formulario
    const signUp = document.getElementById("signUp"); // Botón de Registro
    const signIn = document.getElementById("signIn"); // Botón de Login
    let isLoginView = false; // Bandera para saber si está en modo Login

    // Crear un mensaje de estado dinámico para validaciones
    let statusMessage = document.createElement("p");
    statusMessage.style.color = "red"; // Inicialmente rojo para advertencias
    statusMessage.style.marginTop = "10px"; // Espaciado superior
    formulario.appendChild(statusMessage); // Agregar mensaje al formulario

    // Evento que se dispara cuando se envía el formulario
    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

        // Validar el formulario antes de enviarlo
        if (!validarFormulario()) return;

        // Crear un objeto FormData para enviar datos al servidor
        const formData = new FormData();
        formData.append("Nombre", inputNombre.value.trim()); // Añadir el nombre
        formData.append("NumNomina", inputNomina.value.trim().padStart(8, "0")); // Completar el número de nómina a 8 dígitos
        formData.append("Contrasena", inputContrasena.value.trim()); // Añadir la contraseña

        // Enviar los datos al servidor mediante fetch
        fetch('https://grammermx.com/IvanTest/dao/registroUsuario.php', {
            method: 'POST', // Método HTTP para enviar datos
            body: formData, // Datos del formulario
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json(); // Convertir la respuesta a JSON
            })
            .then((data) => {
                if (data.status === "success") {
                    // Mostrar alerta de éxito
                    Swal.fire("¡Registro exitoso!", data.message || "Tu cuenta ha sido creada correctamente", "success");
                } else {
                    // Mostrar mensaje de error
                    statusMessage.textContent = data.message || "Hubo un problema al procesar tu registro";
                }
            })
            .catch((error) => {
                // Manejar errores de red o del servidor
                console.error("Error:", error);
                statusMessage.textContent = "Error en la comunicación con el servidor";
            });
    });

    // Función para validar los datos del formulario
    function validarFormulario() {
        const nombre = inputNombre.value.trim(); // Obtener y limpiar el nombre
        const numeroNomina = inputNomina.value.trim(); // Obtener y limpiar el número de nómina
        const contrasena = inputContrasena.value.trim(); // Obtener y limpiar la contraseña

        // Validar que todos los campos estén llenos
        if (!nombre || !numeroNomina || !contrasena) {
            statusMessage.textContent = "Completa todos los campos";
            return false;
        }

        // Validar que el número de nómina tenga exactamente 5 dígitos
        if (numeroNomina.length !== 5) {
            statusMessage.textContent = "El Número de Nómina debe tener 5 dígitos exactos";
            return false;
        }

        // Validación exitosa
        statusMessage.textContent = "Formulario enviado correctamente";
        statusMessage.style.color = "green"; // Mensaje en verde si todo está bien
        return true;
    }

    // Evento para el botón de Login
    signIn.addEventListener("click", function () {
        if (isLoginView) {
            // Redirigir a otra página si ya está en Login
            window.location.href = "otra_pagina.html"; // Cambia por la página deseada
        } else {
            // Cambiar a modo Login
            nameGroup.style.maxHeight = "0"; // Ocultar el campo de nombre
            nameGroup.style.overflow = "hidden"; // Evitar que el contenido sea visible
            title.textContent = "Login"; // Cambiar el título a Login
            signIn.classList.add("disable"); // Deshabilitar el botón de Login
            signUp.classList.remove("disable"); // Habilitar el botón de Registro
            isLoginView = true; // Cambiar bandera a modo Login
        }
    });

    // Evento para el botón de Registro
    signUp.addEventListener("click", function () {
        if (!isLoginView) {
            // Si ya está en modo Registro, enviar el formulario
            formulario.dispatchEvent(new Event("submit"));
        } else {
            // Cambiar a modo Registro
            nameGroup.style.maxHeight = "60px"; // Mostrar el campo de nombre
            nameGroup.style.overflow = "visible"; // Asegurar que el contenido sea visible
            title.textContent = "Registro"; // Cambiar el título a Registro
            signUp.classList.add("disable"); // Deshabilitar el botón de Registro
            signIn.classList.remove("disable"); // Habilitar el botón de Login
            isLoginView = false; // Cambiar bandera a modo Registro
        }
    });
});