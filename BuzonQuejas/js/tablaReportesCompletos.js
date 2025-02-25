document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");

    // 🔄 Función global para mover el reporte a la tabla de completados
    window.moverReporteACompletados = function (reporte) {
        let nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${reporte.folio}</td>
            <td>${reporte.nomina}</td>
            <td>${reporte.encargado}</td>
            <td>${reporte.fechaFinalizacion}</td>
            <td>${reporte.estatus}</td>
            <td><button class="convertidor">Convertir</button></td>
        `;

        // 🔹 Agregar evento al botón de "Convertir" (opcional, si se implementará)
        let btnConvertir = nuevaFila.querySelector(".convertidor");
        btnConvertir.addEventListener("click", function () {
            alert(`Convertir reporte ${reporte.folio} - (Funcionalidad pendiente de implementar)`);
        });

        // ➕ Agregar la nueva fila a la tabla de completados
        tablaCompletosBody.appendChild(nuevaFila);
    };
});
