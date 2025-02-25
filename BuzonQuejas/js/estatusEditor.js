// estatusEditor.js

// ✅ Función para abrir el modal de fecha (ajústala según tu implementación)

// ✅ Función para actualizar el texto del botón en la celda
function updateStatusButton(cell, newStatus) {
    const btn = cell.querySelector('.estatus-btn');
    if (btn) {
        btn.innerText = newStatus;
    }
}

// ✅ Inicializa la funcionalidad del editor de estatus
function initEstatusEditor() {
    // Selecciona todas las celdas de estatus (asegúrate de que tengan la clase "estatus-cell")
    document.querySelectorAll('.estatus-cell').forEach(cell => {
        // Guarda el valor actual y reemplázalo por un botón solo si no existe
        let currentStatus = cell.innerText.trim();

        // ✅ Verifica si ya tiene un botón para evitar duplicados
        if (!cell.querySelector('.estatus-btn')) {
            cell.innerHTML = `<button class="estatus-btn">${currentStatus}</button>`;
        }

        // ✅ Asocia el evento al botón
        cell.querySelector('.estatus-btn').addEventListener('click', function () {
            // Usa SweetAlert2 para mostrar un selector
            Swal.fire({
                title: 'Seleccione el estatus',
                input: 'select',
                inputOptions: {
                    'en_proceso': 'En Proceso',
                    'pendiente': 'Pendiente',
                    'finalizado': 'Finalizado'
                },
                inputValue: currentStatus.toLowerCase().replace(" ", "_"),
                showCancelButton: true,
                inputPlaceholder: 'Seleccione un estatus'
            }).then((result) => {
                if (result.isConfirmed) {
                    let selected = result.value;
                    if (selected === 'finalizado') {
                        // ✅ Muestra solo la advertencia sin redirigir al modal de fecha
                        Swal.fire({
                            icon: 'warning',
                            title: 'No puedes finalizar el reporte aún',
                            text: 'Debes asignar una fecha antes de finalizar el reporte.',
                            confirmButtonText: 'Entendido'
                        });
                    } else {
                        let statusText = selected === 'en_proceso' ? 'En Proceso' : 'Pendiente';
                        updateStatusButton(cell, statusText);
                    }
                }
            });
        });
    });
}

// ✅ Expón la función globalmente para volver a inicializar en otras acciones
window.initEstatusEditor = initEstatusEditor;

// ✅ Inicializa la funcionalidad cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initEstatusEditor);
