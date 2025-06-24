// seleccionadorCasos.js
// Requiere SweetAlert2 cargado en la página (Swal.fire)

document.addEventListener('DOMContentLoaded', () => {
    const table      = document.getElementById('tabla-historial');
    const headerRow  = table.querySelector('thead tr');
    let   checkAll   = headerRow.querySelector('#check-all-historial');

    // 1) Inyectar el checkbox “Seleccionar todos” si no existe
    if (!checkAll) {
        const th = document.createElement('th');
        th.style.width     = '40px';
        th.style.textAlign = 'center';
        checkAll = document.createElement('input');
        checkAll.type      = 'checkbox';
        checkAll.id        = 'check-all-historial';
        checkAll.style.display = 'none';
        th.appendChild(checkAll);
        headerRow.insertBefore(th, headerRow.firstChild);
    }

    // 2) Inyectar un checkbox por cada fila si falta
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let cb = row.querySelector('.check-folio');
        if (!cb) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            cb = document.createElement('input');
            cb.type       = 'checkbox';
            cb.className  = 'check-folio';
            // Asignar el folio como valor
            cb.value      = row.cells[2].textContent.trim(); // ojo: folio está en la 3ª celda
            cb.style.display = 'none';
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    // 3) Preparar toggle y comportamiento
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    const allCbs    = () => Array.from(table.querySelectorAll('.check-folio'));
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        const cbs = allCbs();

        // Mostrar/ocultar + contorno verde
        cbs.forEach(cb => {
            cb.style.display = seleccionActiva ? '' : 'none';
            cb.style.outline = seleccionActiva ? '2px solid #2ea043' : '';
            cb.style.outlineOffset = '2px';
        });
        checkAll.style.display = seleccionActiva ? '' : 'none';
        checkAll.style.outline = seleccionActiva ? '2px solid #2ea043' : '';
        checkAll.style.outlineOffset = '2px';

        // Cambiar texto del botón
        toggleBtn.textContent  = seleccionActiva
            ? '✅ Confirmar envío'
            : '📤 Enviar por correo';

        if (seleccionActiva) {
            // 🎉 SweetAlert al activar selección
            Swal.fire({
                title: 'Modo Selección Activado',
                text:  'Ahora puedes marcar los correos que quieras enviar.',
                icon:  'info',
                confirmButtonText: '¡Entendido!'
            });
        } else {
            // Al desactivar, desmarcar todo
            cbs.forEach(cb => cb.checked = false);
            checkAll.checked = false;
        }
    });

    // 4) “Seleccionar todos”
    checkAll.addEventListener('change', () => {
        allCbs().forEach(cb => cb.checked = checkAll.checked);
    });

    console.log('✅ seleccionadorCasos.js cargado — encontré',
        allCbs().length, 'checkboxes');
});
