/* --- JS: js/enviarReporte.js --- */
/**
 * @file enviarReporte.js
 * @description
 * Controla el flujo de envío de un nuevo reporte de queja:
 *  1. Captura el número de nómina del usuario desde el DOM.
 *  2. Valida la selección de área, supervisor/shift leader y el texto de la queja.
 *  3. Ensambla el objeto de datos y lo envía al backend mediante fetch POST.
 *  4. Emite un mensaje por BroadcastChannel para notificar nuevos reportes.
 *  5. Muestra alertas de éxito/error con SweetAlert2 y permite reiniciar o cerrar sesión.
 *
 * Requiere:
 *  - Un <span id="nominaUsuario"> con el número de nómina.
 *  - Un botón <button id="btnFinalizar">.
 *  - Selects con id="area", id="supervisor" y id="shiftLeader".
 *  - Un textarea o input con id="reporte".
 *  - SweetAlert2 (Swal) cargado.
 *  - Funciones globales window.reiniciarFormulario() y window.cerrarSesion().
 */

    // 1. Variable global para guardar el número de nómina
let numeroNominaGlobal = null;

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       2. Captura del número de nómina desde el DOM
    ───────────────────────────────────────── */
    const nominaSpan = document.getElementById("nominaUsuario");
    if (nominaSpan) {
        numeroNominaGlobal = nominaSpan.textContent.trim();
    }

    /* ─────────────────────────────────────────
       3. Configuración del botón "Finalizar"
    ───────────────────────────────────────── */
    const btnFinalizar = document.getElementById("btnFinalizar");

    btnFinalizar.addEventListener("click", function () {

        /* ─────────────────────────────────────────
           3.1 Lectura de valores del formulario
        ───────────────────────────────────────── */
        const areaSelect        = document.getElementById("area");
        const reporteText       = document.getElementById("reporte").value.trim();
        const supervisorSelect  = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");
        const ID_PRODUCCION     = "1";

        /* ─────────────────────────────────────────
           3.2 Debug opcional
        ───────────────────────────────────────── */
        console.log("🧪 Área seleccionada:",    areaSelect.value);
        console.log("🧪 Queja escrita:",       reporteText);
        console.log("🧪 Supervisor:",         supervisorSelect.value);
        console.log("🧪 Shift Leader:",        shiftLeaderSelect.value);

        /* ─────────────────────────────────────────
           3.3 Validaciones
        ───────────────────────────────────────── */
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

        /* ─────────────────────────────────────────
           3.4 Recolectar datos del reporte
        ───────────────────────────────────────── */
        let reporteData = {
            NumNomina: numeroNominaGlobal,
            IdArea:    areaSelect.value,
            Descripcion: reporteText
        };

        if (parseInt(areaSelect.value) === 1) {
            reporteData.IdEncargado    = supervisorSelect.value;
            reporteData.IdShiftLeader  = shiftLeaderSelect.value;
        }

        /* ─────────────────────────────────────────
           3.5 Envío de datos al backend
        ───────────────────────────────────────── */
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
                    // 4. Notificar nuevo reporte
                    const canal = new BroadcastChannel("canalReportes");
                    canal.postMessage({
                        tipo: "nuevo-reporte",
                        folio: data.folio
                    });
                    canal.close();

                    // Limpiar campos
                    document.getElementById("reporte").value      = "";
                    areaSelect.value                            = "";
                    supervisorSelect.value                      = "";
                    shiftLeaderSelect.value                     = "";

                    // 5. Alerta de éxito y acciones
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
