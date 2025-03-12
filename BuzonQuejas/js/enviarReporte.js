document.addEventListener("DOMContentLoaded", function () {
    const btnSiguiente = document.getElementById("btnSiguiente");

    btnSiguiente.addEventListener("click", function () {
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");
        const numNomina = "00030318"; // 🔥 DE MOMENTO FIJO, LUEGO SE TOMARÁ DE LA SESIÓN

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
            NumNomina: numNomina,
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
