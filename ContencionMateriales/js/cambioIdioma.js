document.addEventListener("DOMContentLoaded", () => {
    const languageBtn = document.getElementById("btn-language-toggle");

    let currentLang = localStorage.getItem("lang") || "es";
    applyLanguage(currentLang);

    languageBtn.addEventListener("click", () => {
        currentLang = currentLang === "es" ? "en" : "es";
        localStorage.setItem("lang", currentLang);
        applyLanguage(currentLang);
    });

    function applyLanguage(lang) {
        const translations = {
            "es": {
                "DATA": "DATOS",
                "Responsible": "Responsable",
                "Select a responsible": "Selecciona un responsable",
                "Part No.": "No. Parte",
                "Quantity": "Cantidad",
                "Description": "Descripción",
                "Case description": "Descripción del caso",
                "Tertiary": "Terciaria",
                "Select option": "Selecciona opción",
                "Supplier of the Part": "Proveedor de la Pieza",
                "Select the part supplier": "Selecciona al proveedor de pieza",
                "Commodity": "Commodity",
                "Select commodity": "Selecciona commodity",
                "Defects": "Defectos",
                "Select defect": "Selecciona defecto",
                "Photos/Evidence": "Fotos/Evidencia",
                "Add Photos": "Agregar Fotos",
                "Submit": "Confirmar",
                "My Cases": "Mis Casos",
                "Case No.": "Folio",
                "Date": "Fecha Registro",
                "Show description": "Mostrar descripción",
                "Admin": "Administrador"
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

        const dict = translations[lang];

        document.querySelectorAll("label, h1, button, option, th, strong, p").forEach(el => {
            const text = el.textContent.trim();
            if (dict[text]) {
                el.textContent = dict[text];
            }
        });

        document.querySelectorAll("input, textarea").forEach(el => {
            const placeholder = el.getAttribute("placeholder");
            if (placeholder && dict[placeholder]) {
                el.setAttribute("placeholder", dict[placeholder]);
            }
        });
    }
});