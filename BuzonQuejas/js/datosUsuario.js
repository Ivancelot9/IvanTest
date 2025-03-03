document.addEventListener("DOMContentLoaded", function () {
    fetch("dao/obtenerUsuario.php")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Actualizar los campos en "Datos Personales"
                document.getElementById("nombre").value = data.nombre;
                document.getElementById("nomina").value = data.nomina;

                // Actualizar el nombre en el sidebar sin afectar su estilo
                document.getElementById("sidebar-nombre").textContent = data.nombre;
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => console.error("Error en la petición:", error));
});
