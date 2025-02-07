document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = modal.querySelector(".close-modal");

    const reportes = {
        "001": { folio: "001", numeroNomina: "123456", descripcion: "Reporte de prueba 1", estatus: "Completado" },
        "002": { folio: "002", numeroNomina: "654321", descripcion: "Reporte de prueba 2", estatus: "Pendiente" },
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

                    modal.style.display = "block";
                }
            });
        });
    }

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    cargarTabla();
});
