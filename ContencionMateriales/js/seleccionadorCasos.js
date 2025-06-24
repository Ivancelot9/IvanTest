// seleccionadorCasos.js
// Requiere SweetAlert2 (Swal.fire) incluído en la página

document.addEventListener('DOMContentLoaded', () => {
    const table      = document.getElementById('tabla-historial');
    const headerRow  = table.querySelector('thead tr');
    let   checkAll   = headerRow.querySelector('#check-all-historial');

    // ── 1) Si ya existe un checkAll del HTML, mantenlo; si no, lo inyectas ──
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

    // ── 2) Inyectar un checkbox por cada fila si faltara ──
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let cb = row.querySelector('.check-folio');
        if (!cb) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            cb = document.createElement('input');
            cb.type       = 'checkbox';
            cb.className  = 'check-folio';
            // El folio está en la 3ª celda (índice 2)
            cb.value      = row.cells[2].textContent.trim();
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    // ── 3) Ocultar TODO al inicio ──
    const allCbs = () => Array.from(table.querySelectorAll('.check-folio'));
    allCbs().forEach(cb => cb.style.display = 'none');
    checkAll.style.display = 'none';

    // ── 4) Toggle del botón ──
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        const cbs = allCbs();

        if (seleccionActiva) {
            // • mostrar y marcar todos
            cbs.forEach(cb => {
                cb.style.display = '';
                cb.checked       = true;
                cb.classList.add('pulse-check');
            });
            checkAll.style.display = '';
            checkAll.checked       = true;
            checkAll.classList.add('pulse-check');

            // • SweetAlert explicativo
            Swal.fire({
                title: 'Modo Selección Activado',
                text:  'Marca los correos que quieras enviar.',
                icon:  'info',
                confirmButtonText: '¡Entendido!'
            });

            toggleBtn.textContent = '✅ Confirmar envío';
        } else {
            // • ocultar y desmarcar todo
            cbs.forEach(cb => {
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

    // ── 5) “Seleccionar todos” dentro del modo selección ──
    checkAll.addEventListener('change', () => {
        allCbs().forEach(cb => {
            cb.checked = checkAll.checked;
        });
    });

    console.log('✅ seleccionadorCasos.js cargado — encontrados', allCbs().length, 'checkboxes');
});
