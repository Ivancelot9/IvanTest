document.addEventListener("DOMContentLoaded", function () {
    const btnSiguiente = document.getElementById("btnSiguiente");

    btnSiguiente.addEventListener("click", function () {
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        // 🔹 Obtener número de nómina desde el HTML
        const numNomina = document.getElementById("nominaUsuario")
            ? document.getElementById("nominaUsuario").textContent.trim()
            : null;

        if (!numNomina) {
            alert("Error: No se encontró el número de nómina.");
            return;
        }

        if (areaSelect.value === "" || reporteText === "") {
            alert("Debes seleccionar un área y escribir tu queja.");
            return;
        }

        let IdEncargado = null;
        if (parseInt(areaSelect.value) === 1) { // Si es Producción
            IdEncargado = supervisorSelect.value || shiftLeaderSelect.value;
            if (!IdEncargado) {
                alert("Debes seleccionar un Supervisor o Shift Leader.");
                return;
            }
        }

        const reporteData = {
            NumNomina: numNomina, // Ahora lo obtiene del HTML dinámicamente
            IdArea: areaSelect.value,
            Descripcion: reporteText,
            IdEncargado: IdEncargado
        };

        fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarReporte.php', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reporteData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("¡Reporte enviado correctamente!");
                    window.location.reload(); // 🔥 Recargar la página después de enviar
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("Error al enviar el reporte:", error));
    });
});
