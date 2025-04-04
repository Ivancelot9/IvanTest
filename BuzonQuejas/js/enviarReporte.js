// 🔹 Variable global para guardar el número de nómina
let numeroNominaGlobal = null;

document.addEventListener("DOMContentLoaded", function () {
    const nominaSpan = document.getElementById("nominaUsuario");
    if (nominaSpan) {
        numeroNominaGlobal = nominaSpan.textContent.trim();
    }

    const btnFinalizar = document.getElementById("btnFinalizar");

    btnFinalizar.addEventListener("click", function () {
        // Detectar paso actual desde el DOM
        const steps = document.querySelectorAll(".content");
        let pasoActual = 0;
        steps.forEach((step, index) => {
            if (!step.classList.contains("hidden")) {
                pasoActual = index;
            }
        });

        const esUltimoPaso = pasoActual === steps.length - 1;
        if (!esUltimoPaso) return;

        // ✅ Validar paso 2 (Área) y paso 3 (Queja) aunque te hayas saltado con las pestañas
        if (!validarReporte(1)) return; // Paso 2
        if (!validarReporte(2)) return; // Paso 3

        // Recolectar datos
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        let reporteData = {
            NumNomina: numeroNominaGlobal,
            IdArea: areaSelect.value,
            Descripcion: reporteText
        };

        if (parseInt(areaSelect.value) === 1) {
            reporteData.IdEncargado = supervisorSelect.value;
            reporteData.IdShiftLeader = shiftLeaderSelect.value;
        }

        // Enviar al backend
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

                    // Mostrar Swal de éxito
                    Swal.fire({
                        title: "¡Reporte enviado!",
                        text: "¿Qué deseas hacer ahora?",
                        icon: "success",
                        showCancelButton: true,
                        cancelButtonText: "Cerrar sesión",
                        confirmButtonText: "Escribir otro reporte",
                        timer: 120000,
                        timerProgressBar: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.reiniciarFormulario();
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            window.cerrarSesion();
                        } else if (result.dismiss === Swal.DismissReason.timer) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Sesión cerrada por inactividad',
                                text: 'Fuiste redirigido al login por estar inactivo.',
                                showConfirmButton: false,
                                timer: 2500
                            }).then(() => {
                                window.cerrarSesion();
                            });
                        }
                    });

                } else {
                    Swal.fire("Error", data.message || "Ocurrió un error al enviar el reporte.", "error");
                }
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
            });
    });
});
