/* --- JS: js/cargarAreas.js --- */

/**
 * @file cargarAreas.js
 * @description
 * Este script se encarga de poblar dinámicamente el desplegable de áreas
 * llamando al endpoint que devuelve un JSON con la lista de áreas disponibles.
 *
 * Requiere:
 *  - Un elemento <select> con id="area" en el DOM.
 *  - Un endpoint en 'dao/obtenerArea.php' que retorne un JSON con un arreglo
 *    de objetos con las propiedades:
 *      • IdArea       (número identificador del área)
 *      • NombreArea   (nombre descriptivo del área)
 */

document.addEventListener("DOMContentLoaded", function () {
    // Realiza la petición al servidor para obtener las áreas
    fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerArea.php')
        .then(response => response.json())    // Convierte la respuesta a JSON
        .then(data => {
            console.log("Áreas recibidas:", data); // 🔥 Log de depuración

            // Referencia al <select> donde se cargarán las opciones
            const areaSelect = document.getElementById("area");

            // Reinicia el contenido del select, dejando una opción por defecto
            areaSelect.innerHTML = `
                <option value="" disabled selected>
                    Selecciona un área
                </option>
            `;

            // Recorre el array de áreas y crea una <option> por cada una
            data.forEach(area => {
                const option = document.createElement("option");
                option.value       = area.IdArea;      // Valor al enviar el formulario
                option.textContent = area.NombreArea;  // Texto que ve el usuario
                areaSelect.appendChild(option);
            });
        })
        .catch(error => {
            // En caso de error en la petición, lo muestra por consola
            console.error('Error al cargar áreas:', error);
        });
});
