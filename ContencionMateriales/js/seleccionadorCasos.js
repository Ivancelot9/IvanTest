// seleccionadorCasos.js
// Requiere SweetAlert2 (Swal.fire)

document.addEventListener('DOMContentLoaded', () => {
    const table     = document.getElementById('tabla-historial');
    const headerRow = table.querySelector('thead tr');
    let   checkAll  = headerRow.querySelector('#check-all-historial');

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

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (!row.querySelector('.check-folio')) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            const cb = document.createElement('input');
            cb.type      = 'checkbox';
            cb.className = 'check-folio';
            cb.value     = row.cells[2].textContent.trim();
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    const allCbs = () => Array.from(table.querySelectorAll('.check-folio'));
    function disablePulse() {
        allCbs().forEach(x => x.classList.remove('pulse-check'));
        checkAll.classList.remove('pulse-check');
    }
    allCbs().forEach(cb => cb.addEventListener('change', disablePulse));
    checkAll.addEventListener('change', () => {
        allCbs().forEach(cb => {
            cb.checked = checkAll.checked;
            // sincronizar global Set
            if (cb.checked) window.selectedFolios.add(cb.value);
            else            window.selectedFolios.delete(cb.value);
        });
        disablePulse();
    });

    allCbs().forEach(cb => cb.style.display = 'none');
    checkAll.style.display = 'none';

    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    toggleBtn.dataset.selectionActive = 'false';
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        toggleBtn.dataset.selectionActive = seleccionActiva.toString();

        if (seleccionActiva) {
            // mostrar y re-mostrar marcas según Set
            allCbs().forEach(cb => {
                cb.style.display = '';
                cb.checked       = window.selectedFolios.has(cb.value);
                cb.classList.add('pulse-check');
            });
            checkAll.style.display = '';
            // checkAll sólo si todos están marcados
            checkAll.checked = allCbs().length > 0
                && allCbs().every(cb => cb.checked);
            checkAll.classList.add('pulse-check');

            Swal.fire({
                title: 'Modo Selección Activado',
                text:  'Marca los correos que quieras enviar.',
                icon:  'info',
                confirmButtonText: '¡Entendido!'
            });

            toggleBtn.textContent = '✅ Confirmar envío';
        } else {
            // ocultar y desmarcar TODO
            allCbs().forEach(cb => {
                cb.style.display = 'none';
                cb.checked       = false;
                cb.classList.remove('pulse-check');
            });
            checkAll.style.display = 'none';
            checkAll.checked       = false;
            checkAll.classList.remove('pulse-check');

            toggleBtn.textContent = '📤 Enviar por correo';
            // limpiar también el Set?
            // window.selectedFolios.clear();
        }
    });

    console.log('✅ seleccionadorCasos.js cargado —', allCbs().length, 'checkboxes encontrados');
});
