// seleccionadorCasos.js
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
            cb.value      = row.cells[1].textContent.trim();
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
        cbs.forEach(cb => cb.style.display = seleccionActiva ? '' : 'none');
        checkAll.style.display = seleccionActiva ? '' : 'none';
        toggleBtn.textContent  = seleccionActiva
            ? '✅ Confirmar envío'
            : '📤 Enviar por correo';
        if (!seleccionActiva) {
            cbs.forEach(cb => cb.checked = false);
            checkAll.checked = false;
        }
    });

    checkAll.addEventListener('change', () => {
        allCbs().forEach(cb => cb.checked = checkAll.checked);
    });

    console.log('✅ seleccionadorCasos.js cargado — encontré',
        allCbs().length, 'checkboxes');
});
