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
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        const numNomina = numeroNominaGlobal;

        if (!numNomina || areaSelect.value === "" || reporteText === "") {
            return; // ❌ Datos esenciales faltantes, detenemos
        }

        let reporteData = {
            NumNomina: numNomina,
            IdArea: areaSelect.value,
            Descripcion: reporteText
        };

        // Si es Producción, validar ambos encargados
        if (parseInt(areaSelect.value) === 1) {
            const IdEncargado = supervisorSelect.value;
            const IdShiftLeader = shiftLeaderSelect.value;

            if (!IdEncargado || !IdShiftLeader) {
                return;
            }

            reporteData.IdEncargado = IdEncargado;
            reporteData.IdShiftLeader = IdShiftLeader;
        }

        // Enviar a la API
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
                    // Emitir el nuevo reporte por BroadcastChannel
                    const canal = new BroadcastChannel("canalReportes");
                    canal.postMessage({
                        tipo: "nuevo-reporte",
                        folio: data.folio
                    });
                    canal.close();

                    // Limpiar campos
                    document.getElementById("reporte").value = "";
                    areaSelect.value = "";
                    supervisorSelect.value = "";
                    shiftLeaderSelect.value = "";
                }
            })
            .catch(() => {
                // No mostramos errores de red
            });
    });
});
