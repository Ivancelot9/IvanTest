document.addEventListener("DOMContentLoaded", function () {
    // 🔊 Canal para notificar finalización de reportes a otras pestañas
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

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

    let fechaSeleccionada = document.getElementById("fecha-seleccionada");
    let btnGuardar = document.getElementById("guardar-fecha");
    let btnCerrar = document.getElementById("cerrar-fecha");
    let lastClickedButton = null;
    let folioSeleccionado = null;

    function updateTheme(monthIndex) {
        const themes = [
            'theme-january', 'theme-february', 'theme-march', 'theme-april',
            'theme-may', 'theme-june', 'theme-july', 'theme-august',
            'theme-september', 'theme-october', 'theme-november', 'theme-december'
        ];
        themes.forEach(theme => modalFecha.classList.remove(theme));
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
        onReady: (_, __, instance) => updateTheme(instance.currentMonth),
        onMonthChange: (_, __, instance) => updateTheme(instance.currentMonth),
        onYearChange: (_, __, instance) => updateTheme(instance.currentMonth),
        onChange: (selectedDates, dateStr) => {
            fechaSeleccionada.value = dateStr;
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            folioSeleccionado = lastClickedButton.getAttribute("data-folio");
            modalFecha.style.display = "flex";
            modalOverlay.style.display = "block";
        }
    });

    btnGuardar.addEventListener("click", function () {
        let fecha = fechaSeleccionada.value;
        if (!fecha || !folioSeleccionado) {
            Swal.fire("Error", "Selecciona una fecha válida.", "error");
            return;
        }

        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/insertarFechaFinalizacion.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folio: folioSeleccionado, fechaFinalizada: fecha })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${folioSeleccionado}`)
                        .then(res => res.json())
                        .then(reporteBD => {
                            if (!reporteBD || !reporteBD.FolioReportes) {
                                Swal.fire("Error", "No se pudo obtener el reporte actualizado.", "error");
                                return;
                            }

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

                            // ✅ Mover localmente a la tabla de completados
                            if (window.moverReporteACompletados) {
                                window.moverReporteACompletados(reporte);
                            }

                            // ✅ Notificar a otras pestañas que este reporte fue finalizado
                            canalFinalizados.postMessage(reporte);


                            // ✅ Refrescar visual si ya está abierta la tabla 2
                            const tablaCompletos = document.getElementById("reportes-completos");
                            if (tablaCompletos && tablaCompletos.style.display !== "none") {
                                if (typeof window.mostrarReportesCompletos === "function") {
                                    window.mostrarReportesCompletos(1);
                                }
                            }

                            // ✅ Remover de tabla 1
                            const fila = lastClickedButton.closest("tr");
                            if (fila) fila.remove();

                            Swal.fire("Éxito", "El reporte fue finalizado correctamente.", "success");
                        })
                        .catch(() => Swal.fire("Error", "No se pudo obtener el reporte actualizado desde la base de datos.", "error"));
                } else {
                    Swal.fire("Error", data.message || "No se pudo guardar en BD.", "error");
                }
            })
            .catch(() => Swal.fire("Error", "No se pudo conectar con el servidor.", "error"));

        modalFecha.style.display = "none";
        modalOverlay.style.display = "none";
    });

    btnCerrar.addEventListener("click", () => {
        modalFecha.style.display = "none";
        modalOverlay.style.display = "none";
    });

    window.addEventListener("click", e => {
        if (e.target === modalFecha || e.target === modalOverlay) {
            modalFecha.style.display = "none";
            modalOverlay.style.display = "none";
        }
    });
});
