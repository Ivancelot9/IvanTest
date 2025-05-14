document.addEventListener("DOMContentLoaded", () => {
    const languageBtn = document.getElementById("btn-language-toggle");
    let currentLang = "es"; // Valor por defecto

    languageBtn.addEventListener("click", () => {
        currentLang = currentLang === "es" ? "en" : "es";
        cambiarIdioma(currentLang);
    });

    function cambiarIdioma(lang) {
        const traducciones = {
            "es": {
                "DATOS": "DATOS",
                "Responsable": "Responsable",
                "Selecciona un responsable": "Selecciona un responsable",
                "No. Parte": "No. Parte",
                "Cantidad": "Cantidad",
                "Descripción": "Descripción",
                "Descripción del caso": "Descripción del caso",
                "Terciaria": "Terciaria",
                "Selecciona opción": "Selecciona opción",
                "Proveedor": "Proveedor",
                "Selecciona proveedor": "Selecciona proveedor",
                "Commodity": "Commodity",
                "Selecciona commodity": "Selecciona commodity",
                "Defectos": "Defectos",
                "Selecciona defecto": "Selecciona defecto",
                "Fotos/Evidencia": "Fotos/Evidencia",
                "Agregar Fotos": "Agregar Fotos",
                "Confirmar": "Confirmar",
                "Mis Casos": "Mis Casos",
                "Folio": "Folio",
                "Fecha Registro": "Fecha Registro",
                "Mostrar descripción": "Mostrar descripción",
                "Administrador": "Administrador"
            },
            "en": {
                "DATOS": "DATA",
                "Responsable": "Responsible",
                "Selecciona un responsable": "Select a responsible",
                "No. Parte": "Part No.",
                "Cantidad": "Quantity",
                "Descripción": "Description",
                "Descripción del caso": "Case description",
                "Terciaria": "Tertiary",
                "Selecciona opción": "Select option",
                "Proveedor": "Supplier",
                "Selecciona proveedor": "Select supplier",
                "Commodity": "Commodity",
                "Selecciona commodity": "Select commodity",
                "Defectos": "Defects",
                "Selecciona defecto": "Select defect",
                "Fotos/Evidencia": "Photos/Evidence",
                "Agregar Fotos": "Add Photos",
                "Confirmar": "Submit",
                "Mis Casos": "My Cases",
                "Folio": "Case No.",
                "Fecha Registro": "Date",
                "Mostrar descripción": "Show description",
                "Administrador": "Admin"
            }
        };

        document.querySelectorAll("label, h1, button, option, th").forEach(el => {
            const original = el.textContent.trim();
            const newText = traducciones[lang][original];
            if (newText) el.textContent = newText;
        });

        // También cambiar el placeholder si aplica
        document.querySelectorAll("input, textarea").forEach(el => {
            const ph = el.getAttribute("placeholder");
            if (ph && traducciones[lang][ph]) {
                el.setAttribute("placeholder", traducciones[lang][ph]);
            }
        });
    }
});