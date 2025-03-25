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
            let IdEncargado = supervisorSelect.value || shiftLeaderSelect.value;
            if (!IdEncargado) {
                alert("Debes seleccionar un Supervisor o Shift Leader.");
                return;
            }
            reporteData.IdEncargado = IdEncargado;
        }

        console.log("Datos que se enviarán al backend:", reporteData);

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

                    // Crear objeto simulado del nuevo reporte
                    let nuevoReporte = {
                        folio: data.folio || "N/A",
                        fechaRegistro: new Date().toISOString().split("T")[0],
                        nomina: reporteData.NumNomina,
                        area: areaSelect.options[areaSelect.selectedIndex].text,
                        encargado: reporteData.IdEncargado || "Sin asignar",
                        descripcion: reporteData.Descripcion,
                        comentarios: "Sin comentarios",
                        estatus: "Pendiente",
                        fechaFinalizacion: ""
                    };

                    // Agregar localmente si aplica
                    if (typeof window.agregarReporteAHistorial === "function") {
                        window.agregarReporteAHistorial(nuevoReporte);
                    }

                    // 🟢 Notificar al admin en tiempo real con BroadcastChannel
                    const canal = new BroadcastChannel("canalReportes");
                    canal.postMessage({ tipo: "nuevo-reporte", data: nuevoReporte });
                    canal.close();

                    // Actualizar contador tipo Messenger
                    const badge = document.getElementById("contador-historial");
                    let count = parseInt(localStorage.getItem("contadorHistorial") || "0");
                    count++;
                    localStorage.setItem("contadorHistorial", count.toString());

                    if (badge) {
                        badge.textContent = count.toString();
                        badge.style.display = "inline-block";
                    }

                    // Limpiar campos del formulario
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
