document.addEventListener("DOMContentLoaded", function () {
    // 🔊 Canal para notificar finalización de reportes a otras pestañas
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

    // ── Crear modal de selección de fecha ─────────────────────────────────────
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
    </div>`;
    let modalOverlay = document.createElement("div");
    modalOverlay.id = "estatus-modal-overlay";
    document.body.appendChild(modalOverlay);
    document.body.appendChild(modalFecha);

    // ── Variables del modal ─────────────────────────────────────────────────
    const fechaSeleccionada = document.getElementById("fecha-seleccionada");
    const btnGuardar        = document.getElementById("guardar-fecha");
    const btnCerrar         = document.getElementById("cerrar-fecha");
    let lastClickedButton   = null;
    let folioSeleccionado   = null;

    // ── Tema dinámico del calendario ─────────────────────────────────────────
    function updateTheme(monthIndex) {
        const themes = [
            'theme-january','theme-february','theme-march','theme-april',
            'theme-may','theme-june','theme-july','theme-august',
            'theme-september','theme-october','theme-november','theme-december'
        ];
        themes.forEach(t => modalFecha.classList.remove(t));
        modalFecha.classList.add(themes[monthIndex]);
    }

    flatpickr("#calendario-container", {
        inline: true,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        minDate: "today",
        locale: "es",
        disableMobile: true,
        monthSelectorType: "static",
        onReady:    (_,__,inst) => updateTheme(inst.currentMonth),
        onMonthChange: (_,__,inst) => updateTheme(inst.currentMonth),
        onYearChange:  (_,__,inst) => updateTheme(inst.currentMonth),
        onChange:      (_,dateStr) => { fechaSeleccionada.value = dateStr; }
    });

    // ── Abrir modal al pulsar “Finalizar Reporte” ───────────────────────────
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            folioSeleccionado = lastClickedButton.getAttribute("data-folio");
            modalFecha.style.display   = "flex";
            modalOverlay.style.display = "block";
        }
    });

    // ── Guardar fecha y notificar ──────────────────────────────────────────
    btnGuardar.addEventListener("click", function () {
        const fecha = fechaSeleccionada.value;
        if (!fecha || !folioSeleccionado) {
            Swal.fire("Error", "Selecciona una fecha válida.", "error");
            return;
        }

        // 1) Insertar fecha en la base de datos
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarFechaFinalizacion.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folio: folioSeleccionado, fechaFinalizada: fecha })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status !== "success") {
                    throw new Error(data.message || "No se pudo guardar en BD.");
                }
                // 2) Obtener reporte ya finalizado
                return fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${folioSeleccionado}`);
            })
            .then(res => res.json())
            .then(reporteBD => {
                if (!reporteBD?.FolioReportes) {
                    Swal.fire("Error", "No se pudo obtener el reporte actualizado.", "error");
                    return;
                }

                // 3) Construir objeto reporte
                const reporte = {
                    folio:              reporteBD.FolioReportes,
                    fechaRegistro:      reporteBD.FechaRegistro,
                    nomina:             reporteBD.NumeroNomina,
                    area:               reporteBD.Area || "Sin área",
                    encargado:          reporteBD.Encargado || "N/A",
                    descripcion:        reporteBD.Descripcion || "Sin descripción",
                    comentarios:        reporteBD.Comentarios || "Sin comentarios",
                    fechaFinalizacion:  fecha,
                    estatus:            "Completado"
                };

                // 4) Mover localmente a la tabla de completados
                if (window.moverReporteACompletados) {
                    window.moverReporteACompletados(reporte);
                }

                // 5) Enviar Broadcast con origen = userId
                const userId = document.body.getAttribute("data-user-id") || "default";
                canalFinalizados.postMessage({ ...reporte, origen: userId });

                // 6) Eliminar fila de la tabla 1 en esta pestaña
                const fila = lastClickedButton.closest("tr");
                if (fila) fila.remove();

                Swal.fire("Éxito", "El reporte fue finalizado correctamente.", "success");
            })
            .catch(err => {
                Swal.fire("Error", err.message || "No se pudo conectar con el servidor.", "error");
            });

        // Cerrar modal
        modalFecha.style.display   = "none";
        modalOverlay.style.display = "none";
    });

    // ── Cerrar modal sin guardar ────────────────────────────────────────────
    btnCerrar.addEventListener("click", () => {
        modalFecha.style.display   = "none";
        modalOverlay.style.display = "none";
    });
    window.addEventListener("click", e => {
        if (e.target === modalFecha || e.target === modalOverlay) {
            modalFecha.style.display   = "none";
            modalOverlay.style.display = "none";
        }
    });
});
