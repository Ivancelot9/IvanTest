/**
 * @file seleccionadorCasos.js
 * @project Contención de Materiales
 * @module seleccionadorCasos
 * @purpose Inyectar dinámicamente checkboxes en la tabla de historial para seleccionar casos
 * @description Este script permite alternar un modo de selección para marcar casos de una tabla
 *              HTML, con opción de seleccionar individualmente o todos a la vez. Se sincroniza
 *              con `modalEnviarCorreos.js` para el envío de correos electrónicos con los folios seleccionados.
 * @dependencies
 *    - SweetAlert2 (Swal.fire)
 *    - modalEnviarCorreos.js (lectura de checkboxes con clase `.check-folio`)
 * @author Ivan Medina / Hadbet Altamirano
 * @created Julio 2025
 * @updated [¿?]
 */

document.addEventListener('DOMContentLoaded', () => {
    const table      = document.getElementById('tabla-historial');
    const headerRow  = table.querySelector('thead tr');
    let   checkAll   = headerRow.querySelector('#check-all-historial');

    /**
     * Inserta el checkbox global "Seleccionar todo" si no existe aún
     */
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

    /**
     * Inserta un checkbox por cada fila (folio), si no existe aún
     */
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let cb = row.querySelector('.check-folio');
        if (!cb) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            cb = document.createElement('input');
            cb.type      = 'checkbox';
            cb.className = 'check-folio';
            cb.value     = row.cells[2].textContent.trim(); // Valor del folio (columna 3)
            td.appendChild(cb);
            row.insertBefore(td, row.firstChild);
        }
    });

    // Helpers para seleccionar todos los checkboxes
    const allCbs = () => Array.from(table.querySelectorAll('.check-folio'));

    /**
     * Elimina la animación visual de selección activa (clase pulse-check)
     */
    function disablePulse() {
        allCbs().forEach(x => x.classList.remove('pulse-check'));
        checkAll.classList.remove('pulse-check');
    }

    // Desactiva animación cuando se hace clic individual
    allCbs().forEach(cb => cb.addEventListener('change', disablePulse));

    /**
     * Al marcar el checkbox global, selecciona o deselecciona todos los casos
     */
    checkAll.addEventListener('change', () => {
        allCbs().forEach(x => x.checked = checkAll.checked);
        disablePulse();
    });

    // Oculta todos los checkboxes al iniciar (modo no selección)
    allCbs().forEach(cb => cb.style.display = 'none');
    checkAll.style.display = 'none';

    /**
     * Botón de activación del modo selección
     */
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    toggleBtn.dataset.selectionActive = 'false';
    let seleccionActiva = false;

    /**
     * Alterna entre modo selección (mostrar checkboxes) y modo normal (ocultar)
     */
    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        toggleBtn.dataset.selectionActive = seleccionActiva.toString();

        if (seleccionActiva) {
            // === ENTRAMOS EN MODO SELECCIÓN ===
            allCbs().forEach(cb => {
                cb.style.display = '';
                cb.checked       = window.selectedFolios?.has(cb.value) || false;
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
            // === SALIMOS DEL MODO SELECCIÓN ===
            if (window.selectedFolios) {
                window.selectedFolios.clear(); // Limpiar selección global
            }

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
