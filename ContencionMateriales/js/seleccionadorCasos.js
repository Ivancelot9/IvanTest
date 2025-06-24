document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 seleccionHistorial.js cargado');
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    const checkAll  = document.getElementById('check-all-historial');
    let checkboxes = document.querySelectorAll('#tabla-historial .check-folio');

    console.log('→ toggleBtn:', toggleBtn);
    console.log('→ checkAll:', checkAll);
    console.log('→ checkboxes iniciales:', checkboxes.length);

    if (!toggleBtn || !checkAll) {
        console.error('❌ No se encontró el botón o el checkbox global');
        return;
    }

    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;
        console.log('🔀 Modo selección:', seleccionActiva);

        // (Re-query por si hay filas nuevas dinámicamente)
        checkboxes = document.querySelectorAll('#tabla-historial .check-folio');
        console.log('→ checkboxes ahora:', checkboxes.length);

        // Mostrar/ocultar individual
        checkboxes.forEach(cb => {
            cb.style.display = seleccionActiva ? '' : 'none';
        });

        // Mostrar/ocultar global
        checkAll.style.display = seleccionActiva ? '' : 'none';

        // Cambiar texto del botón
        toggleBtn.textContent = seleccionActiva
            ? '✅ Confirmar envío'
            : '📤 Enviar por correo';

        // Limpiar selección al desactivar
        if (!seleccionActiva) {
            checkboxes.forEach(cb => cb.checked = false);
            checkAll.checked = false;
        }
    });

    checkAll.addEventListener('change', () => {
        console.log('🔘 checkAll cambiado:', checkAll.checked);
        checkboxes.forEach(cb => cb.checked = checkAll.checked);
    });
});
