document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = modal.querySelector(".close-modal");

    const reportes = {
        "001": { folio: "001", numeroNomina: "123456", descripcion: "Reporte de prueba 1", estatus: "Completado", fechaRegistro: "01/02/2025", fechaInicio: "02/02/2025", fechaFinalizada: "05/02/2025", comentarios: "Reporte finalizado sin problemas" },
        "002": { folio: "002", numeroNomina: "654321", descripcion: "Reporte de prueba 2", estatus: "Pendiente", fechaRegistro: "10/02/2025", fechaInicio: "11/02/2025", fechaFinalizada: "-", comentarios: "En espera de revisión" }
    };

    function cargarTabla() {
        const tabla = document.querySelector("#tabla-reportes tbody");
        tabla.innerHTML = "";

        Object.keys(reportes).forEach((folio) => {
            const reporte = reportes[folio];
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.numeroNomina}</td>
                <td>${reporte.descripcion}</td>
                <td><button class="mostrar-reporte" data-folio="${reporte.folio}">Mostrar Reporte</button></td>
            `;

            tabla.appendChild(fila);
        });

        document.querySelectorAll(".mostrar-reporte").forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const folio = e.target.dataset.folio;
                const datos = reportes[folio];

                if (datos) {
                    document.getElementById("detalle-folio").textContent = datos.folio;
                    document.getElementById("detalle-nomina").textContent = datos.numeroNomina;
                    document.getElementById("detalle-descripcion").textContent = datos.descripcion;
                    document.getElementById("detalle-estatus").textContent = datos.estatus;
                    document.getElementById("detalle-fecha-registro").textContent = datos.fechaRegistro;
                    document.getElementById("detalle-fecha-inicio").textContent = datos.fechaInicio;
                    document.getElementById("detalle-fecha-finalizada").textContent = datos.fechaFinalizada;
                    document.getElementById("detalle-comentarios").textContent = datos.comentarios;

                    modal.classList.add("show"); // Aparece con animación
                    modal.style.display = "flex";
                }
            });
        });
    }

    closeModal.addEventListener("click", () => {
        modal.classList.remove("show"); // Oculta con animación
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    });

    cargarTabla();
});