document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    const checkboxes = document.querySelectorAll('#tabla-historial .check-folio');
    const checkAll = document.getElementById('check-all-historial');
    let seleccionActiva = false;

    toggleBtn.addEventListener('click', () => {
        seleccionActiva = !seleccionActiva;

        // Mostrar/ocultar checkboxes individuales
        checkboxes.forEach(cb => {
            cb.style.display = seleccionActiva ? 'inline-block' : 'none';
        });

        // Mostrar/ocultar checkbox global
        checkAll.style.display = seleccionActiva ? 'inline-block' : 'none';

        // Cambiar texto del botón
        toggleBtn.textContent = seleccionActiva ? '✅ Confirmar envío' : '📤 Enviar por correo';

        // Limpiar selección si se desactiva
        if (!seleccionActiva) {
            checkboxes.forEach(cb => cb.checked = false);
            checkAll.checked = false;
        }
    });

    checkAll.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = checkAll.checked);
    });
});