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
        // ✅ Detectar paso actual desde el DOM (más confiable que leer el texto del botón)
        const steps = document.querySelectorAll(".content");
        let pasoActual = 0;
        steps.forEach((step, index) => {
            if (!step.classList.contains("hidden")) {
                pasoActual = index;
            }
        });

        const esUltimoPaso = pasoActual === steps.length - 1;
        if (!esUltimoPaso) return; // ⛔ No hacemos nada si aún no es el último paso

        // 🧠 Ya se validó antes de este punto, así que solo enviamos

        // ✅ Recolectar datos del formulario
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

        // 📤 Enviar reporte al backend
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarReporte.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reporteData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("📥 Respuesta del servidor:", data);

                if (data.status === "success") {
                    // 📡 Emitir mensaje por canal
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

                    // ✅ El Swal de éxito ya lo muestra pestanasReporte.js
                } else {
                    Swal.fire("Error", data.message || "Ocurrió un error al enviar el reporte.", "error");
                }
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
            });
    });
});
