// 🔹 Variable global para guardar el número de nómina
let numeroNominaGlobal = null;

document.addEventListener("DOMContentLoaded", function () {
    // ✅ Guardar el número de nómina al cargar la página
    const nominaSpan = document.getElementById("nominaUsuario");
    if (nominaSpan) {
        numeroNominaGlobal = nominaSpan.textContent.trim();
        console.log("✅ Número de nómina detectado:", numeroNominaGlobal);
    } else {
        console.warn("❌ No se encontró el elemento nominaUsuario");
    }

    const btnSiguiente = document.getElementById("btnSiguiente");

    btnSiguiente.addEventListener("click", function () {
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        const numNomina = numeroNominaGlobal;

        if (!numNomina) {
            alert("Error: No se encontró el número de nómina.");
            return;
        }

        if (areaSelect.value === "" || reporteText === "") {
            alert("Debes seleccionar un área y escribir tu queja.");
            return;
        }

        let reporteData = {
            NumNomina: numNomina,
            IdArea: areaSelect.value,
            Descripcion: reporteText
        };

        if (parseInt(areaSelect.value) === 1) {
            const IdEncargado = supervisorSelect.value;
            const IdShiftLeader = shiftLeaderSelect.value;

            if (!IdEncargado || !IdShiftLeader) {
                alert("Debes seleccionar tanto el Supervisor como el Shift Leader.");
                return;
            }

            reporteData.IdEncargado = IdEncargado;
            reporteData.IdShiftLeader = IdShiftLeader;
        }

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
                    alert("¡Reporte enviado correctamente!");

                    // 🔴 Solo enviamos el FOLIO al canal
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
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error al enviar el reporte:", error);
                alert("Ocurrió un error al enviar el reporte.");
            });
    });
});
