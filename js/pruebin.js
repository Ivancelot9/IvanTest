document.addEventListener("DOMContentLoaded", function () {
    // Referencias a los campos del formulario
    const inputNombre = document.getElementById("Nombre");
    const inputNomina = document.getElementById("NumNomina");
    const inputContrasena = document.getElementById("Contrasena");
    const formulario = document.getElementById("formularioRegistro");

    // Mensaje de advertencia dinámico
    let statusMessage = document.createElement("p");
    statusMessage.style.color = "red";
    statusMessage.style.marginTop = "10px";
    formulario.appendChild(statusMessage);

    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Validar formulario
        if (!validarFormulario()) return;//verga

        // Enviar datos al servidor
        const formData = new FormData();
        formData.append("Nombre", inputNombre.value.trim());
        formData.append("NumNomina", inputNomina.value.trim().padStart(8, "0")); // Completa con 3 ceros
        formData.append("Contrasena", inputContrasena.value.trim());

        fetch('https://grammermx.com/dao/registroUsuario.php', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    Swal.fire("¡Registro exitoso!", data.message || "Tu cuenta ha sido creada correctamente", "success");
                } else {
                    statusMessage.textContent = data.message || "Hubo un problema al procesar tu registro";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                statusMessage.textContent = "Error en la comunicación con el servidor";
            });
    });

    function validarFormulario() {
        const nombre = inputNombre.value.trim();
        const numeroNomina = inputNomina.value.trim();
        const contrasena = inputContrasena.value.trim();

        // Validar que los campos no estén vacíos
        if (!nombre || !numeroNomina || !contrasena) {
            statusMessage.textContent = "Completa todos los campos";
            return false;
        }

        // Validar que el número de nómina tenga 5 dígitos
        if (numeroNomina.length !== 5) {
            statusMessage.textContent = "El Número de Nómina debe tener 5 dígitos exactos";
            return false;
        }

        statusMessage.textContent = "Formulario enviado correctamente";
        statusMessage.style.color = "green";
        return true;
    }
});
