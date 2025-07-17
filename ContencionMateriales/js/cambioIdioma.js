/**
 * ============================================================================
 * @file cambioIdioma.js
 * @project Contención de Materiales
 * @module interfaz_usuario
 * @purpose Controlar el cambio dinámico de idioma entre Español e Inglés
 * @description Este script detecta el idioma seleccionado por el usuario mediante
 * localStorage y actualiza todos los textos visibles (labels, botones, placeholders, etc.)
 * del sistema para mostrar la traducción correspondiente.
 * Utiliza un diccionario incrustado con claves en ambos idiomas.
 *
 * @note Este sistema de traducción fue diseñado inicialmente como solución temporal
 * con un botón que alterna entre dos idiomas. La intención original es reemplazar
 * esta lógica por un sistema más dinámico (posiblemente usando una librería de
 * internacionalización como i18next) cuando el proyecto esté finalizado.
 *
 * @author Ivan Medina / Hadbet Altamirano
 * @created Mayo 2025
 * @updated [¿?]
 * ============================================================================
 */


// Espera a que todo el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    const languageBtn = document.getElementById("btn-language-toggle");

    // 🌐 Cargar idioma actual desde localStorage (default: español)
    let currentLang = localStorage.getItem("lang") || "es";
    applyLanguage(currentLang);

    // 🔁 Al hacer clic en el botón, alterna idioma y guarda preferencia
    languageBtn.addEventListener("click", () => {
        currentLang = currentLang === "es" ? "en" : "es";
        localStorage.setItem("lang", currentLang);
        applyLanguage(currentLang);
    });

    /**
     * 🧠 Función que aplica las traducciones
     * @param {string} lang - Código del idioma ("es" o "en")
     */
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

        // 🏷️ Cambia textos visibles (etiquetas, botones, encabezados)
        document.querySelectorAll("label, h1, button, option, th, strong, p").forEach(el => {
            const text = el.textContent.trim();
            if (dict[text]) {
                el.textContent = dict[text];
            }
        });

        // 📝 Cambia placeholders de inputs y textareas
        document.querySelectorAll("input, textarea").forEach(el => {
            const placeholder = el.getAttribute("placeholder");
            if (placeholder && dict[placeholder]) {
                el.setAttribute("placeholder", dict[placeholder]);
            }
        });
    }
});
