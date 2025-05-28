// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username    = document.body.dataset.username;
    const canal       = new BroadcastChannel(`casosChannel_${username}`);
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge       = btnMisCasos.querySelector('.badge-count');
    const storageKey  = `newCasesCount_${username}`;
    let contador      = parseInt(localStorage.getItem(storageKey) || '0', 10);

    // Inicializa el badge
    actualizarBadge(contador);

    // Solo actualiza el badge al recibir mensajes (mismo usuario en otras pestañas)
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // Al hacer click en “Mis casos”, resetea el badge
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // Aquí tu lógica para mostrar sección #historial…
    });

    // Helper para el badge
    function actualizarBadge(c) {
        if (c > 0) {
            badge.textContent = c;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
