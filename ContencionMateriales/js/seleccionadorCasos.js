// seleccionadorCasos.js
// Requiere SweetAlert2 cargado (Swal.fire)

document.addEventListener('DOMContentLoaded', () => {
    const table      = document.getElementById('tabla-historial');
    const headerRow  = table.querySelector('thead tr');
    let   checkAll   = headerRow.querySelector('#check-all-historial');

    // 1) Inyectar “select all” si falta
    if (!checkAll) {
        const th = document.createElement('th');
        th.style.width     = '40px';
        th.style.textAlign = 'center';
        checkAll = document.createElement('input');
        checkAll.type      = 'checkbox';
        checkAll.id        = 'check-all-historial';
        th.appendChild(checkAll);
        headerRow.insertBefore(th, headerRow.firstChild);
    }

    // 2) Inyectar un checkbox en cada fila si faltara
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let cb = row.querySelector('.check-folio');
        if (!cb) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            cb = document.createElement('input');
            cb.type      = 'checkbox';
            cb.className = 'check-folio';
            cb.value     = row.cells[2].textContent.trim(); // Folio en la 3ª celda
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    // 3) Helpers
    const allCbs = () => Array.from(table.querySelectorAll('.check-folio'));

    // Al primer cambio en cualquier checkbox, quitamos el pulso de todos
    function disablePulse() {
        allCbs().forEach(x => x.classList.remove('pulse-check'));
        checkAll.classList.remove('pulse-check');
    }
    allCbs().forEach(cb => cb.addEventListener('change', disablePulse));
    checkAll.addEventListener('change', () => {
        allCbs().forEach(x => x.checked = checkAll.checked);
        disablePulse();
    });

    // 4) Ocultar al inicio
    allCbs().forEach(cb => cb.style.display = 'none');
    checkAll.style.display = 'none';

    // 5) Toggle modo selección
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;

        if (seleccionActiva) {
            // Mostrar, desmarcar y añadir pulso
            allCbs().forEach(cb => {
                cb.style.display = '';
                cb.checked       = false;
                cb.classList.add('pulse-check');
            });
            checkAll.style.display = '';
            checkAll.checked       = false;
            checkAll.classList.add('pulse-check');

            Swal.fire({
                title: 'Modo Selección Activado',
                text:  'Marca los correos que quieras enviar.',
                icon:  'info',
                confirmButtonText: '¡Entendido!'
            });

            toggleBtn.textContent = '✅ Confirmar envío';
        } else {
            // Ocultar, desmarcar y quitar pulso
            allCbs().forEach(cb => {
                cb.style.display = 'none';
                cb.checked       = false;
                cb.classList.remove('pulse-check');
            });
            checkAll.style.display = 'none';
            checkAll.checked       = false;
            checkAll.classList.remove('pulse-check');

            toggleBtn.textContent = '📤 Enviar por correo';
        }
    });

    console.log('✅ seleccionadorCasos.js cargado —', allCbs().length, 'checkboxes encontrados');
});
