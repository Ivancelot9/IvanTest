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
                    // Traer datos de la fila actual
                    let fila = lastClickedButton.closest("tr");
                    let folio = fila.children[0].textContent.trim();
                    let nomina = fila.children[2].textContent.trim();
                    let encargado = fila.children[4].textContent.trim();

                    window.moverReporteACompletados({
                        folio,
                        nomina,
                        encargado,
                        fechaFinalizacion: fecha,
                        estatus: "Completado"
                    });

                    fila.remove(); // Eliminar de la tabla 1
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
