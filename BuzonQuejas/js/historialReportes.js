document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script del iframe cargado correctamente");

    const iframeContainer = document.getElementById("iframe-container");
    const iframeContent = document.getElementById("iframe-content");
    const closeIframe = document.getElementById("close-iframe");
    const botonesMostrar = document.querySelectorAll(".mostrar-reporte");

    if (!iframeContainer || !iframeContent || !closeIframe || botonesMostrar.length === 0) {
        console.error("❌ ERROR: No se encontró el iframe, el botón de cerrar o los botones de reporte.");
        return;
    }

    const reportes = {
        "001": "reporte-001.html", // Ruta al archivo HTML del reporte
        "002": "reporte-002.html"  // Ruta al archivo HTML del reporte
    };

    // Abrir iframe con el contenido correspondiente
    botonesMostrar.forEach(boton => {
        boton.addEventListener("click", (event) => {
            const folio = event.target.getAttribute("data-folio");
            if (reportes[folio]) {
                iframeContent.src = reportes[folio]; // Cargar el contenido en el iframe
                iframeContainer.style.display = "flex"; // Mostrar el iframe flotante
            } else {
                console.warn("⚠️ No hay contenido para este folio.");
            }
        });
    });

    // Cerrar iframe
    closeIframe.addEventListener("click", () => {
        iframeContainer.style.display = "none";
        iframeContent.src = ""; // Limpia el contenido del iframe
    });
});
