document.addEventListener("DOMContentLoaded", () => {
    const detalleReporte = document.getElementById("detalle-reporte");
    const cerrarDetalle = document.getElementById("cerrar-detalle");

    const reportes = {
        "001": {
            folio: "001",
            numeroNomina: "123456",
            fechaRegistro: "2025-02-01",
            fechaInicio: "2025-02-02",
            fechaFinalizada: "2025-02-03",
            descripcion: "Revisión de calidad en planta.",
            comentarios: "Todo en orden.",
            estatus: "Completado"
        },
        "002": {
            folio: "002",
            numeroNomina: "654321",
            fechaRegistro: "2025-02-05",
            fechaInicio: "2025-02-06",
            fechaFinalizada: "Pendiente",
            descripcion: "Inspección de maquinaria.",
            comentarios: "Se requiere refacción.",
            estatus: "En proceso"
        }
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
                    document.getElementById("reporte-folio").textContent = datos.folio;
                    document.getElementById("reporte-nomina").textContent = datos.numeroNomina;
                    document.getElementById("reporte-fecha-registro").textContent = datos.fechaRegistro;
                    document.getElementById("reporte-fecha-inicio").textContent = datos.fechaInicio;
                    document.getElementById("reporte-fecha-finalizada").textContent = datos.fechaFinalizada;
                    document.getElementById("reporte-descripcion").textContent = datos.descripcion;
                    document.getElementById("reporte-comentarios").textContent = datos.comentarios;
                    document.getElementById("reporte-estatus").textContent = datos.estatus;

                    detalleReporte.style.display = "block";
                }
            });
        });
    }

    cerrarDetalle.addEventListener("click", () => {
        detalleReporte.style.display = "none";
    });

    cargarTabla();
});
