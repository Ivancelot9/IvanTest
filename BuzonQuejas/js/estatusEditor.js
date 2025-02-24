// estatus-editor.js

// Función que abre el modal de fecha (asegúrate de que exista o importarla)
function openDateModal() {
    // Ejemplo: mostrar el modal de fecha
    document.getElementById("modal-fecha").style.display = "flex";
}

// Inicializa la funcionalidad de edición de estatus en las celdas
function initEstatusEditor() {
    document.querySelectorAll('.estatus-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            // Evita que se active el modo edición si ya está
            if (cell.querySelector('select')) return;

            let currentValue = cell.innerText.trim();

            // Crea el elemento select con las opciones
            let select = document.createElement('select');
            select.innerHTML = `
                <option value="en_proceso" ${currentValue === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                <option value="pendiente" ${currentValue === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="finalizado" ${currentValue === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
            `;

            // Reemplaza el contenido de la celda por el select
            cell.innerHTML = "";
            cell.appendChild(select);
            select.focus();

            // Cuando se cambia la selección
            select.addEventListener('change', function() {
                let selected = select.value;
                if (selected === 'finalizado') {
                    openDateModal(); // Abre el modal de fecha para confirmar la finalización
                    cell.innerText = 'Finalizado';
                } else {
                    cell.innerText = selected === 'en_proceso' ? 'En Proceso' : 'Pendiente';
                }
            });

            // Si se pierde el foco sin cambio, restaura el valor original
            select.addEventListener('blur', function() {
                if (!select.value) {
                    cell.innerText = currentValue;
                }
            });
        });
    });
}

// Exporta la función si estás usando módulos (opcional)
// export { initEstatusEditor };

// Inicializa la funcionalidad cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initEstatusEditor);
