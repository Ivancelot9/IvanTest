document.addEventListener("DOMContentLoaded", () => {
    // Referencias principales
    const modal = document.getElementById("modal-detalle-reporte"); // Modal
    const closeModal = modal.querySelector(".close-modal"); // Botón de cerrar
    const body = document.body; // Para manejar el scroll

    // Datos simulados de los reportes
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

    // Cargar la tabla de reportes
    function cargarTabla() {
        const tabla = document.querySelector("#tabla-reportes tbody");
        tabla.innerHTML = ""; // Limpia cualquier contenido previo

        // Generar filas dinámicamente
        Object.keys(reportes).forEach((folio) => {
            const reporte = reportes[folio];
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.numeroNomina}</td>
                <td>${reporte.descripcion}</td>
                <td>
                    <button class="mostrar-reporte" data-folio="${reporte.folio}">
                        Mostrar Reporte
                    </button>
                </td>
            `;
            tabla.appendChild(fila); // Agregar fila a la tabla
        });

        // Asignar eventos a los botones
        document.querySelectorAll(".mostrar-reporte").forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const folio = e.target.dataset.folio; // Obtener el folio del reporte
                const datos = reportes[folio]; // Obtener datos del reporte

                if (datos) {
                    // Llenar el modal con los datos del reporte
                    document.getElementById("detalle-folio").textContent = datos.folio;
                    document.getElementById("detalle-nomina").textContent = datos.numeroNomina;
                    document.getElementById("detalle-descripcion").textContent = datos.descripcion;
                    document.getElementById("detalle-estatus").textContent = datos.estatus;
                    document.getElementById("detalle-fecha-registro").textContent = datos.fechaRegistro;
                    document.getElementById("detalle-fecha-inicio").textContent = datos.fechaInicio;
                    document.getElementById("detalle-fecha-finalizada").textContent = datos.fechaFinalizada;
                    document.getElementById("detalle-comentarios").textContent = datos.comentarios;

                    // Mostrar el modal
                    modal.classList.add("show");
                    body.classList.add("modal-open"); // Desactiva el scroll del fondo
                }
            });
        });
    }

    // Evento para cerrar el modal
    closeModal.addEventListener("click", () => {
        modal.classList.remove("show"); // Ocultar modal
        body.classList.remove("modal-open"); // Reactivar scroll
    });

    // Cerrar el modal al hacer clic fuera de él
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
            body.classList.remove("modal-open");
        }
    });

    // Cargar la tabla de reportes al iniciar
    cargarTabla();
});