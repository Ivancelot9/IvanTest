// 🔹 Variable global para guardar el número de nómina
let numeroNominaGlobal = null;

document.addEventListener("DOMContentLoaded", function () {
    // ✅ Guardar el número de nómina al cargar la página
    const nominaSpan = document.getElementById("nominaUsuario");
    if (nominaSpan) {
        numeroNominaGlobal = nominaSpan.textContent.trim();
    }

    const btnSiguiente = document.getElementById("btnSiguiente");

    btnSiguiente.addEventListener("click", function () {
        // 🛑 Validar antes de continuar (esto usa validacionesReportes.js)
        if (!validarReporte()) return;

        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        let reporteData = {
            NumNomina: numeroNominaGlobal,
            IdArea: areaSelect.value,
            Descripcion: reporteText
        };

        // 🟡 Solo incluir estos campos si el área es Producción
        if (parseInt(areaSelect.value) === 1) {
            reporteData.IdEncargado = supervisorSelect.value;
            reporteData.IdShiftLeader = shiftLeaderSelect.value;
        }

        // Enviar reporte al backend
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarReporte.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reporteData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    // 🔊 Emitir mensaje por canal
                    const canal = new BroadcastChannel("canalReportes");
                    canal.postMessage({
                        tipo: "nuevo-reporte",
                        folio: data.folio
                    });
                    canal.close();

                    // 🔄 Limpiar campos
                    document.getElementById("reporte").value = "";
                    areaSelect.value = "";
                    supervisorSelect.value = "";
                    shiftLeaderSelect.value = "";

                    // No se ejecuta ningún Swal aquí. Solo lo que tú ya tengas definido.
                } else {
                    Swal.fire("Error", data.message || "Ocurrió un error al enviar el reporte.", "error");
                }
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
            });
    });
});
