/* --- JS: js/fechaFinalizacion.js --- */
/**
 * @file fechaFinalizacion.js
 * @description
 * Controla el modal de selección de fecha de finalización para reportes:
 *  1. Inicializa un overlay y un modal con un calendario inline (flatpickr).
 *  2. Permite escoger una fecha mínima de hoy en adelante.
 *  3. Envía la fecha seleccionada al backend para guardar la finalización.
 *  4. Obtiene el reporte actualizado y lo mueve a la tabla de completados.
 *  5. Notifica a otras pestañas sobre el reporte finalizado via BroadcastChannel.
 *  6. Actualiza las vistas de las tablas 1 y 2 en tiempo real.
 *
 * Requiere:
 *  - Flatpickr cargado en el proyecto.
 *  - SweetAlert2 (Swal) globalmente disponible.
 *  - Botones con clase "seleccionar-fecha" y atributo data-folio en cada fila.
 *  - Funciones globales:
 *      • window.moverReporteACompletados(reporte)
 *      • window.mostrarReportesCompletos(pagina)
 *  - Endpoints:
 *      • POST "dao/insertarFechaFinalizacion.php" { folio, fechaFinalizada }
 *      • GET  "dao/obteneReportesPorFolio.php?folio=…"
 */

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Inicialización del BroadcastChannel
    ───────────────────────────────────────── */
    // Canal para notificar finalización a otras pestañas
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

    /* ─────────────────────────────────────────
       2. Creación de overlay y modal
    ───────────────────────────────────────── */
    let modalFecha = document.createElement("div");
    modalFecha.id = "modal-fecha";
    modalFecha.style.display = "none";
    modalFecha.innerHTML = `
    <div class="modal-fecha">
        <h2>Seleccionar Fecha de Finalización</h2>
        <div id="calendario-container"></div>
        <input type="text" id="fecha-seleccionada" placeholder="Selecciona una fecha" readonly />
        <div class="botones-container">
            <button id="cerrar-fecha">Cancelar</button>
            <button id="guardar-fecha">Finalizar Reporte</button>
        </div>
    </div>
    `;
    let modalOverlay = document.createElement("div");
    modalOverlay.id = "estatus-modal-overlay";
    document.body.appendChild(modalOverlay);
    document.body.appendChild(modalFecha);

    /* ─────────────────────────────────────────
       3. Referencias a elementos del DOM
    ───────────────────────────────────────── */
    let fechaSeleccionada   = document.getElementById("fecha-seleccionada");
    let btnGuardar          = document.getElementById("guardar-fecha");
    let btnCerrar           = document.getElementById("cerrar-fecha");
    let lastClickedButton   = null;
    let folioSeleccionado   = null;

    /* ─────────────────────────────────────────
       4. Función para cambiar tema según mes
    ───────────────────────────────────────── */
    function updateTheme(monthIndex) {
        const themes = [
            'theme-january','theme-february','theme-march','theme-april',
            'theme-may','theme-june','theme-july','theme-august',
            'theme-september','theme-october','theme-november','theme-december'
        ];
        themes.forEach(theme => modalFecha.classList.remove(theme));
        modalFecha.classList.add(themes[monthIndex]);
    }

    /* ─────────────────────────────────────────
       5. Inicializar flatpickr en el contenedor
    ───────────────────────────────────────── */
    flatpickr("#calendario-container", {
        inline: true,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        minDate: "today",
        locale: "es",
        disableMobile: true,
        monthSelectorType: "static",
        onReady: (_, __, instance) => updateTheme(instance.currentMonth),
        onMonthChange: (_, __, instance) => updateTheme(instance.currentMonth),
        onYearChange: (_, __, instance) => updateTheme(instance.currentMonth),
        onChange: (selectedDates, dateStr) => {
            fechaSeleccionada.value = dateStr;
        }
    });

    /* ─────────────────────────────────────────
       6. Delegación para abrir modal de fecha
    ───────────────────────────────────────── */
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            folioSeleccionado = lastClickedButton.getAttribute("data-folio");
            modalFecha.style.display    = "flex";
            modalOverlay.style.display  = "block";
        }
    });

    /* ─────────────────────────────────────────
       7. Guardar fecha y mover reporte
    ───────────────────────────────────────── */
    btnGuardar.addEventListener("click", function () {
        let fecha = fechaSeleccionada.value;
        if (!fecha || !folioSeleccionado) {
            Swal.fire("Error", "Selecciona una fecha válida.", "error");
            return;
        }

        // Enviar fecha al backend
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarFechaFinalizacion.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folio: folioSeleccionado, fechaFinalizada: fecha })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    // Obtener reporte actualizado
                    return fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${folioSeleccionado}`)
                        .then(res => res.json())
                        .then(reporteBD => {
                            if (!reporteBD || !reporteBD.FolioReportes) {
                                Swal.fire("Error", "No se pudo obtener el reporte actualizado.", "error");
                                return;
                            }
                            // Construir objeto reporte
                            const reporte = {
                                folio: reporteBD.FolioReportes,
                                fechaRegistro: reporteBD.FechaRegistro,
                                nomina: reporteBD.NumeroNomina,
                                area: reporteBD.Area || "Sin área",
                                encargado: reporteBD.Encargado || "N/A",
                                descripcion: reporteBD.Descripcion || "Sin descripción",
                                comentarios: reporteBD.Comentarios || "Sin comentarios",
                                fechaFinalizacion: fecha,
                                estatus: "Completado"
                            };
                            // Mover localmente
                            if (window.moverReporteACompletados) {
                                window.moverReporteACompletados(reporte);
                            }
                            // Notificar a otras pestañas
                            const userId = document.body.getAttribute("data-user-id") || "default";
                            canalFinalizados.postMessage({ ...reporte, origen: userId });
                            // Refrescar tabla completados si está abierta
                            const tablaCompletos = document.getElementById("reportes-completos");
                            if (tablaCompletos && tablaCompletos.style.display !== "none") {
                                if (typeof window.mostrarReportesCompletos === "function") {
                                    window.mostrarReportesCompletos(1);
                                }
                            }
                            // Eliminar de tabla pendientes
                            const fila = lastClickedButton.closest("tr");
                            if (fila) fila.remove();
                            Swal.fire("Éxito", "El reporte fue finalizado correctamente.", "success");
                        });
                } else {
                    Swal.fire("Error", data.message || "No se pudo guardar en BD.", "error");
                }
            })
            .catch(() => Swal.fire("Error", "No se pudo conectar con el servidor.", "error"));

        // Cerrar modal
        modalFecha.style.display   = "none";
        modalOverlay.style.display = "none";
    });

    /* ─────────────────────────────────────────
       8. Cerrar modal sin guardar
    ───────────────────────────────────────── */
    btnCerrar.addEventListener("click", () => {
        modalFecha.style.display   = "none";
        modalOverlay.style.display = "none";
    });

    /* ─────────────────────────────────────────
       9. Cerrar modal al hacer clic fuera
    ───────────────────────────────────────── */
    window.addEventListener("click", e => {
        if (e.target === modalFecha || e.target === modalOverlay) {
            modalFecha.style.display   = "none";
            modalOverlay.style.display = "none";
        }
    });
});
