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
        const nuevoNombre = nombreInput.value;

        fetch("dao/modificarDatosPersonales.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Nombre actualizado correctamente.");
                    nombreInput.setAttribute("readonly", "true");
                    editarBtn.style.display = "inline-block";
                    guardarBtn.style.display = "none";

                    // También actualizar el nombre en el sidebar
                    document.getElementById("sidebar-nombre").textContent = nuevoNombre;
                } else {
                    alert("Error al actualizar: " + data.message);
                }
            })
            .catch(error => console.error("Error en la petición:", error));
    });
});
