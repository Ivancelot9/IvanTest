document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de fecha de finalización
    let modalFecha = document.createElement("div");
    modalFecha.id = "modal-fecha";
    modalFecha.style.display = "none";
    modalFecha.innerHTML = `
    <div class="modal-fecha">
        <h2>Seleccionar Fecha de Finalización</h2>
        <div id="calendario-container"></div> <!-- 📅 Calendario siempre visible -->
        <input type="text" id="fecha-seleccionada" placeholder="Selecciona una fecha" readonly />
        <div class="botones-container">
            <button id="cerrar-fecha">Cancelar</button>
            <button id="guardar-fecha">Finalizar Reporte</button>
        </div>
    </div>
    `;

    // 🔹 Agregar el modal al body
    document.body.appendChild(modalFecha);

    let fechaSeleccionada = document.getElementById("fecha-seleccionada");
    let btnGuardar = document.getElementById("guardar-fecha");
    let btnCerrar = document.getElementById("cerrar-fecha");
    let lastClickedButton = null;

    // ▪ Función para actualizar el tema según el mes
    function updateTheme(monthIndex) {
        const themes = [
            'theme-january',
            'theme-february',
            'theme-march',
            'theme-april',
            'theme-may',
            'theme-june',
            'theme-july',
            'theme-august',
            'theme-september',
            'theme-october',
            'theme-november',
            'theme-december'
        ];
        // Remover cualquier clase de tema existente
        themes.forEach(theme => {
            modalFecha.classList.remove(theme);
        });
        // Agregar la clase correspondiente al mes actual
        modalFecha.classList.add(themes[monthIndex]);
    }

    // 🔹 Inicializar Flatpickr con eventos para actualizar el tema
    flatpickr("#calendario-container", {
        inline: true,               // Mostrar calendario siempre visible
        dateFormat: "d/m/Y",         // Formato de fecha
        defaultDate: new Date(),     // Fecha actual por defecto
        minDate: "today",            // No permite fechas pasadas
        locale: "es",                // Idioma en español
        disableMobile: true,         // Forzar versión escritorio en móviles
        monthSelectorType: "static", // Selector de mes fijo
        onReady: function(selectedDates, dateStr, instance) {
            updateTheme(instance.currentMonth);
        },
        onMonthChange: function(selectedDates, dateStr, instance) {
            updateTheme(instance.currentMonth);
        },
        onYearChange: function(selectedDates, dateStr, instance) {
            updateTheme(instance.currentMonth);
        },
        onChange: function (selectedDates, dateStr) {
            fechaSeleccionada.value = dateStr;  // Actualizar input cuando se seleccione fecha
        }
    });

    // 🔹 Evento para abrir el modal desde el botón "Seleccionar Fecha"
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            modalFecha.style.display = "flex"; // Mostrar el modal
        }
    });

    // 🔹 Evento para guardar la fecha seleccionada
    btnGuardar.addEventListener("click", function () {
        if (lastClickedButton) {
            let fecha = fechaSeleccionada.value;
            if (fecha) {
                lastClickedButton.parentElement.innerHTML = `
                    <span class="fecha-final">${fecha}</span>
                `;
            } else {
                alert("Por favor selecciona una fecha antes de finalizar el reporte.");
                return;
            }
            modalFecha.style.display = "none"; // Cierra el modal
        }
    });

    // 🔹 Evento para cerrar el modal sin guardar
    btnCerrar.addEventListener("click", function () {
        modalFecha.style.display = "none";
    });

    // 🔹 Cerrar el modal haciendo clic fuera de él
    window.addEventListener("click", function (event) {
        if (event.target === modalFecha) {
            modalFecha.style.display = "none";
        }
    });
});
