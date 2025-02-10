document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script cargado correctamente");

    const botonesMostrar = document.querySelectorAll(".mostrar-reporte");
    const frameContainer = document.getElementById("frame-container");
    const frameReporte = document.getElementById("frame-reporte");

    if (!botonesMostrar.length || !frameContainer || !frameReporte) {
        console.error("❌ ERROR: No se encontraron los elementos necesarios.");
        return;
    }

    // 📌 Rutas de los reportes (cada folio tiene su HTML)
    const reportes = {
        "001": "reporte-001.html",
        "002": "reporte-002.html"
    };

    // 📌 Asignar evento a cada botón de "Mostrar Reporte"
    botonesMostrar.forEach(boton => {
        boton.addEventListener("click", (event) => {
            const folio = event.target.getAttribute("data-folio");

            if (reportes[folio]) {
                frameReporte.src = reportes[folio]; // Cargar el reporte en el iframe
                frameContainer.style.display = "block"; // Mostrar el frame
                console.log(`✅ Mostrando reporte ${folio}`);
            } else {
                console.warn(`⚠️ No hay reporte disponible para el folio ${folio}`);
            }
        });
    });
});