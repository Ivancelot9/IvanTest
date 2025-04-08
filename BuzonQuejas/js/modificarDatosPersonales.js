document.addEventListener("DOMContentLoaded", function () {
    const editarBtn = document.getElementById("editar-btn");
    const guardarBtn = document.getElementById("guardar-btn");
    const nombreInput = document.getElementById("nombre");

    // Habilitar edición
    editarBtn.addEventListener("click", function () {
        nombreInput.removeAttribute("readonly");
        editarBtn.style.display = "none";
        guardarBtn.style.display = "inline-block";
    });

    // Guardar cambios
    guardarBtn.addEventListener("click", function () {
        const nuevoNombre = nombreInput.value.trim();

        // Validar que solo tenga letras y espacios
        const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (!soloLetrasRegex.test(nuevoNombre)) {
            Swal.fire({
                icon: 'error',
                title: 'Nombre inválido',
                html: `
                    El nombre solo puede contener <strong>letras</strong> y <strong>espacios</strong>.<br><br>
                    <u>Ejemplos válidos:</u><br>
                    - Jonathan Canizo<br>
                    - Ivan Alejandro Medina Cerritos<br><br>
                    No se permiten <strong>números</strong> ni <strong>símbolos</strong>.
                `
            });
            return;
        }

        // Si pasa la validación, enviar al servidor
        fetch("dao/modificarDatosPersonales.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Nombre actualizado correctamente.',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    nombreInput.setAttribute("readonly", "true");
                    editarBtn.style.display = "inline-block";
                    guardarBtn.style.display = "none";

                    // También actualizar el nombre en el sidebar
                    document.getElementById("sidebar-nombre").textContent = nuevoNombre;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                console.error("Error en la petición:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un problema al intentar actualizar.'
                });
            });
    });
});
