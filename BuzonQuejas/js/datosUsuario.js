document.addEventListener("DOMContentLoaded", function () {
    const tab_id = sessionStorage.getItem("tab_id");

    fetch(`dao/obtenerUsuario.php?tab_id=${tab_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById("nombre").value = data.nombre;
                document.getElementById("nomina").value = data.nomina;
                document.getElementById("sidebar-nombre").textContent = data.nombre;
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => console.error("Error en la petición:", error));
});
