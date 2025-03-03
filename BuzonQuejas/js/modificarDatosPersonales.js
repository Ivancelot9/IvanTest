document.addEventListener("DOMContentLoaded", function () {
    const editarBtn = document.getElementById("editar-btn");
    const guardarBtn = document.createElement("button");
    guardarBtn.textContent = "Guardar Cambios";
    guardarBtn.classList.add("submit-btn", "guardar-btn");
    guardarBtn.style.display = "none"; // Oculto por defecto

    editarBtn.insertAdjacentElement("afterend", guardarBtn);

    const nombreInput = document.getElementById("nombre");
    const nominaInput = document.getElementById("nomina"); // 📌 Obtenemos el Número de Nómina

    // 📌 Evento para habilitar edición
    editarBtn.addEventListener("click", function () {
        nombreInput.removeAttribute("readonly");
        nombreInput.focus();
        editarBtn.style.display = "none";
        guardarBtn.style.display = "inline-block";
    });

    // 📌 Evento para guardar cambios
    guardarBtn.addEventListener("click", function () {
        const nuevoNombre = nombreInput.value.trim();
        const numeroNomina = nominaInput.value.trim(); // 📌 Obtenemos el Número de Nómina

        if (nuevoNombre === "") {
            Swal.fire("Error", "El nombre no puede estar vacío.", "error");
            return;
        }

        // Enviar datos al servidor (PHP)
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/modificarDatosPersonales.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `nombre=${encodeURIComponent(nuevoNombre)}&nomina=${encodeURIComponent(numeroNomina)}`
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire("Éxito", "Nombre actualizado correctamente.", "success");
                    nombreInput.setAttribute("readonly", "true");
                    editarBtn.style.display = "inline-block";
                    guardarBtn.style.display = "none";
                } else {
                    Swal.fire("Error", "Hubo un problema al actualizar.", "error");
                }
            })
            .catch(error => {
                console.error("Error en la solicitud:", error);
                Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
            });
    });
});
