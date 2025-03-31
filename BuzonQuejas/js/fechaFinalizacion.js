document.addEventListener("DOMContentLoaded", function () {
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
                    let fila = lastClickedButton.closest("tr");
                    if (!fila) return;

                    const celda = index => fila.children[index]?.textContent.trim() || "";

                    let reporte = {
                        folio: celda(0),
                        fechaRegistro: celda(1),
                        nomina: celda(2),
                        area: celda(3),
                        encargado: fila.querySelector(".celda-encargado")?.innerHTML || "N/A",
                        descripcion: lastClickedButton.dataset.descripcion || "Sin descripción",
                        comentarios: "Sin comentarios",
                        fechaFinalizacion: fecha,
                        estatus: "Completado"
                    };

                    // ✅ Mover a la tabla 2 en tiempo real
                    if (window.moverReporteACompletados) {
                        window.moverReporteACompletados(reporte);
                    }
                    // ✅ Actualizar contador visual (estilo Messenger)
                    const badge = document.getElementById("contador-completos");
                    if (badge) {
                        let count = parseInt(localStorage.getItem("contadorCompletos") || "0");
                        count++;
                        badge.textContent = count.toString();
                        badge.style.display = "inline-block";
                        localStorage.setItem("contadorCompletos", count); // 🔴 Guardar en localStorage
                    }

                    // ✅ Forzar actualización visual de tabla 2 si está visible
                    const tablaCompletos = document.getElementById("reportes-completos");
                    if (tablaCompletos && tablaCompletos.style.display !== "none") {
                        if (typeof window.mostrarReportesCompletos === "function") {
                            window.mostrarReportesCompletos(1);
                        }
                    }

                    fila.remove();
                    Swal.fire("Éxito", "El reporte fue finalizado correctamente.", "success");
                } else {
                    Swal.fire("Error", data.message || "No se pudo guardar en BD.", "error");
                }
            })
            .catch(() => Swal.fire("Error", "No se pudo conectar con el servidor.", "error"));

        modalFecha.style.display = "none";
    });

    btnCerrar.addEventListener("click", () => modalFecha.style.display = "none");
    window.addEventListener("click", e => {
        if (e.target === modalFecha) modalFecha.style.display = "none";
    });
});
