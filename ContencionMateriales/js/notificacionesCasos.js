// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const usernameActual = document.body.dataset.username;
    const canal          = new BroadcastChannel(`casosChannel_${usernameActual}`);
    const btnMisCasos    = document.getElementById('btn-mis-casos');
    const badge          = btnMisCasos.querySelector('.badge-count');
    const storageKey     = `newCasesCount_${usernameActual}`;

    // Iniciar badge
    let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
    actualizarBadge(contador);

    // Escuchar notificaciones del canal propio
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // Al hacer click en “Mis casos”, reiniciar badge
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // aquí tu lógica para mostrar #historial…
    });

    // Interceptar el submit y enviar por AJAX
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();                   // 1) evita recarga
        try {
            const resp = await fetch(form.action, {
                method: form.method.toUpperCase(),
                body: new FormData(form)
            });
            const json = await resp.json();

            if (json.status === 'success') {
                // 2) notificación local y por BroadcastChannel
                canal.postMessage({ type: 'new-case' });
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // 3) reiniciar formulario
                form.reset();

                // 4) feedback al usuario
                Swal.fire('¡Caso registrado!', json.message, 'success');
            } else {
                Swal.fire('Error', json.message || 'Algo salió mal', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo conectar al servidor', 'error');
        }
    });

    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
