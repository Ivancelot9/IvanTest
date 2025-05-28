// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) Obtener el username del body
    const usernameActual = document.body.dataset.username;
    // Usamos un canal único por usuario:
    const canal = new BroadcastChannel(`casosChannel_${usernameActual}`);
    // Badge y botón de "Mis casos"
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge      = btnMisCasos.querySelector('.badge-count');
    // Clave de almacenamiento local también por usuario
    const storageKey = `newCasesCount_${usernameActual}`;

    // 2) Inicializar contador desde localStorage
    let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
    actualizarBadge(contador);

    // 3) Escuchar nuevos casos EN ESTE CANAL
    canal.addEventListener('message', ({data}) => {
        if (data.type === 'new-case') {
            // Solo este usuario recibe su propio mensaje
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // 4) Al hacer clic en “Mis casos” reseteamos el contador
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // ...tu lógica para mostrar #historial aquí
    });

    // 5) Capturar el submit del formulario para emitir la notificación
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', () => {
        // Después de que el usuario envíe el caso,
        // avisamos SOLO A SU CANAL
        canal.postMessage({ type: 'new-case' });
    });

    // Función helper para mostrar/ocultar el badge
    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
