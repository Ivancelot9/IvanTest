document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");

    // Función global para mover el reporte a la tabla de completados
    window.moverReporteACompletados = function (reporte) {
        let nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${reporte.folio}</td>
            <td>${reporte.nomina}</td>
            <td>${reporte.encargado}</td>
            <td>${reporte.fechaFinalizacion}</td>
            <td><button class="convertidor">Convertir</button></td>
        `;
        tablaCompletosBody.appendChild(nuevaFila);
    };
});