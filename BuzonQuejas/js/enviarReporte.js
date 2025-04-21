// 🔹 Variable global para guardar el número de nómina
let numeroNominaGlobal = null;

document.addEventListener("DOMContentLoaded", function () {
    const nominaSpan = document.getElementById("nominaUsuario");
    if (nominaSpan) {
        numeroNominaGlobal = nominaSpan.textContent.trim();
    }

    const btnFinalizar = document.getElementById("btnFinalizar");

    btnFinalizar.addEventListener("click", function () {
        const areaSelect = document.getElementById("area");
        const reporteText = document.getElementById("reporte").value.trim();
        const supervisorSelect = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");
        const ID_PRODUCCION = "1";

        // 🔍 Debug opcional
        console.log("🧪 Área seleccionada:", areaSelect.value);
        console.log("🧪 Queja escrita:", reporteText);
        console.log("🧪 Supervisor:", supervisorSelect.value);
        console.log("🧪 Shift Leader:", shiftLeaderSelect.value);

        // 🔒 Validar área
        if (!areaSelect.value || areaSelect.value === "") {
            Swal.fire({
                title: "¡Falta seleccionar el área!",
                text: "Debes seleccionar un área antes de continuar.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        // 🔒 Validar encargados si Producción
        if (areaSelect.value === ID_PRODUCCION) {
            if (!supervisorSelect.value || supervisorSelect.value === "") {
                Swal.fire({
                    title: "¡Falta el Supervisor!",
                    text: "Si seleccionaste Producción, debes elegir un Supervisor.",
                    icon: "warning",
                    confirmButtonText: "Aceptar"
                });
                return;
            }
            if (!shiftLeaderSelect.value || shiftLeaderSelect.value === "") {
                Swal.fire({
                    title: "¡Falta el Shift Leader!",
                    text: "Si seleccionaste Producción, debes elegir un Shift Leader.",
                    icon: "warning",
                    confirmButtonText: "Aceptar"
                });
                return;
            }
        }

        // 🔒 Validar queja
        if (!reporteText || reporteText === "") {
            Swal.fire({
                title: "¡Falta escribir la queja!",
                text: "Escribe tu queja antes de finalizar.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        // ✅ Recolectar datos
        let reporteData = {
            NumNomina: numeroNominaGlobal,
            IdArea: areaSelect.value,
            Descripcion: reporteText
        };

        if (parseInt(areaSelect.value) === 1) {
            reporteData.IdEncargado = supervisorSelect.value;
            reporteData.IdShiftLeader = shiftLeaderSelect.value;
        }

        // 📤 Enviar al backend
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
