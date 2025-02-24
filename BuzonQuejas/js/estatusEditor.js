// estatusEditor.js

// Función para abrir el modal de fecha (ajústala según tu implementación)
function openDateModal() {
    // Por ejemplo, si tu modal tiene id "modal-fecha"
    document.getElementById("modal-fecha").style.display = "flex";
}

// Función para actualizar el texto del botón en la celda
function updateStatusButton(cell, newStatus) {
    const btn = cell.querySelector('.estatus-btn');
    if (btn) {
        btn.innerText = newStatus;
    }
}

// Inicializa la funcionalidad del editor de estatus
function initEstatusEditor() {
    // Selecciona todas las celdas de estatus (asegúrate de que tengan la clase "estatus-cell")
    document.querySelectorAll('.estatus-cell').forEach(cell => {
        // Guarda el valor actual y reemplázalo por un botón
        let currentStatus = cell.innerText.trim();
        cell.innerHTML = `<button class="estatus-btn">${currentStatus}</button>`;

        cell.querySelector('.estatus-btn').addEventListener('click', function() {
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
                        // Muestra un aviso indicando que se debe asignar la fecha
                        Swal.fire({
                            icon: 'warning',
                            title: 'Asignar fecha',
                            text: 'Debe asignar la fecha para finalizar el reporte',
                            confirmButtonText: 'Asignar fecha'
                        }).then(() => {
                            openDateModal();
                            updateStatusButton(cell, 'Finalizado');
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

// Inicializa la funcionalidad cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initEstatusEditor);
