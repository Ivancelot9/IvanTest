// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) Datos del usuario y canal exclusivo
    const usernameActual = document.body.dataset.username;
    const canal = new BroadcastChannel(`casosChannel_${usernameActual}`);

    // 2) Elementos UI
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge       = btnMisCasos.querySelector('.badge-count');
    const storageKey  = `newCasesCount_${usernameActual}`;

    // 3) Inicializar contador desde localStorage
    let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
    actualizarBadge(contador);

    // 4) Listener para otros tabs (mismo usuario)
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // 5) Click en “Mis casos” resetea el badge
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // aquí tu lógica para mostrar la sección #historial…
    });

    // 6) Interceptar envío de formulario para notificar primero
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();                        // detener envío
        canal.postMessage({ type: 'new-case' });   // notificar al canal propio
        contador++;                                // actualizar contador ahora mismo
        localStorage.setItem(storageKey, contador);
        actualizarBadge(contador);
        // esperar un instante y reanudar el submit
        setTimeout(() => form.submit(), 50);
    });

    // Helper para mostrar/ocultar el badge
    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
