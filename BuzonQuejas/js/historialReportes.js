document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos
    const modal = document.getElementById("modal-detalle-reporte"); // El modal
    const closeModal = modal.querySelector(".close-modal"); // Botón de cerrar del modal
    const body = document.body; // Cuerpo del documento

    // Datos de los reportes (puedes reemplazarlos con los tuyos)
    const reportes = {
        "001": {
            folio: "001",
            numeroNomina: "123456",
            descripcion: "Reporte de prueba 1",
            estatus: "Completado",
            fechaRegistro: "01/02/2025",
            fechaInicio: "02/02/2025",
            fechaFinalizada: "05/02/2025",
            comentarios: "Reporte finalizado sin problemas"
        },
        "002": {
            folio: "002",
            numeroNomina: "654321",
            descripcion: "Reporte de prueba 2",
            estatus: "Pendiente",
            fechaRegistro: "10/02/2025",
            fechaInicio: "11/02/2025",
            fechaFinalizada: "-",
            comentarios: "En espera de revisión"
        }
    };

    // Función para cargar la tabla de reportes
    function cargarTabla() {
        const tabla = document.querySelector("#tabla-reportes tbody"); // Selecciona el tbody de la tabla
        tabla.innerHTML = ""; // Limpia la tabla

        // Itera sobre los reportes y crea filas dinámicamente
        Object.keys(reportes).forEach((folio) => {
            const reporte = reportes[folio];
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.numeroNomina}</td>
                <td>${reporte.descripcion}</td>
                <td><button class="mostrar-reporte" data-folio="${reporte.folio}">Mostrar Reporte</button></td>
            `;

            tabla.appendChild(fila); // Agrega la fila a la tabla
        });

        // Agrega eventos a los botones de "Mostrar Reporte"
        document.querySelectorAll(".mostrar-reporte").forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const folio = e.target.dataset.folio; // Obtén el folio del botón
                const datos = reportes[folio]; // Obtén los datos del reporte

                if (datos) {
                    // Llena los datos del modal
                    document.getElementById("detalle-folio").textContent = datos.folio;
                    document.getElementById("detalle-nomina").textContent = datos.numeroNomina;
                    document.getElementById("detalle-descripcion").textContent = datos.descripcion;
                    document.getElementById("detalle-estatus").textContent = datos.estatus;
                    document.getElementById("detalle-fecha-registro").textContent = datos.fechaRegistro;
                    document.getElementById("detalle-fecha-inicio").textContent = datos.fechaInicio;
                    document.getElementById("detalle-fecha-finalizada").textContent = datos.fechaFinalizada;
                    document.getElementById("detalle-comentarios").textContent = datos.comentarios;

                    // Muestra el modal
                    modal.classList.add("show");
                    body.classList.add("modal-open"); // Desactiva el scroll del fondo
                }
            });
        });
    }

    // Cerrar el modal
    closeModal.addEventListener("click", () => {
        modal.classList.remove("show"); // Oculta el modal
        body.classList.remove("modal-open"); // Reactiva el scroll del fondo
    });

    // Cerrar el modal al hacer clic fuera de él
    modal.addEventListener("click", (e) => {
        if (e.target === modal) { // Verifica que se haga clic fuera del contenido
            modal.classList.remove("show");
            body.classList.remove("modal-open");
        }
    });

    // Carga inicial de la tabla de reportes
    cargarTabla();
});
