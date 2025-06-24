// seleccionadorCasos.js
// Requiere SweetAlert2 cargado (Swal.fire)

document.addEventListener('DOMContentLoaded', () => {
    const table      = document.getElementById('tabla-historial');
    const headerRow  = table.querySelector('thead tr');
    let   checkAll   = headerRow.querySelector('#check-all-historial');

    // Inyectar “select all” si falta...
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

    // Inyectar un checkbox por fila si hace falta...
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let cb = row.querySelector('.check-folio');
        if (!cb) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            cb = document.createElement('input');
            cb.type      = 'checkbox';
            cb.className = 'check-folio';
            cb.value     = row.cells[2].textContent.trim(); // folio en columna 3
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    // Helpers
    const allCbs = () => Array.from(table.querySelectorAll('.check-folio'));
    function disablePulse() {
        allCbs().forEach(x => x.classList.remove('pulse-check'));
        checkAll.classList.remove('pulse-check');
    }
    allCbs().forEach(cb => cb.addEventListener('change', disablePulse));
    checkAll.addEventListener('change', () => {
        allCbs().forEach(x => x.checked = checkAll.checked);
        disablePulse();
    });

    // Ocultar al inicio
    allCbs().forEach(cb => cb.style.display = 'none');
    checkAll.style.display = 'none';

    // Toggle modo selección
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    // Flag compartido con data-attribute
    toggleBtn.dataset.selectionActive = 'false';
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        toggleBtn.dataset.selectionActive = seleccionActiva.toString();

        if (seleccionActiva) {
            // === Entramos en MODO SELECCIÓN ===
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
            // === Salimos de MODO SELECCIÓN ===
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
