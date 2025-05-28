// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    // ————————— Configuración básica —————————
    const usernameActual = document.body.dataset.username;
    const canal          = new BroadcastChannel(`casosChannel_${usernameActual}`);
    const btnMisCasos    = document.getElementById('btn-mis-casos');
    const badge          = btnMisCasos.querySelector('.badge-count');
    const storageKey     = `newCasesCount_${usernameActual}`;

    // Iniciar contador
    let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
    actualizarBadge(contador);

    // Escuchar notificaciones en este canal
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // Reset al click
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // ... tu lógica para mostrar #historial…
    });

    // ————————— Interceptar y AJAX submit —————————
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();  // 1) frenamos la navegación automática

        // 2) Preparamos los datos del formulario
        const url      = form.action;
        const method   = form.method.toUpperCase();
        const payload  = new FormData(form);

        try {
            // 3) Enviamos via fetch
            const resp = await fetch(url, {
                method,
                body: payload
            });
            const json = await resp.json();

            if (json.status === 'success') {
                // 4) Notificamos localmente y vía BroadcastChannel
                canal.postMessage({ type: 'new-case' });
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // 5) Opcional: limpia form o muestra mensaje
                form.reset();
                Swal.fire({
                    icon: 'success',
                    title: '¡Caso registrado!',
                    text: json.message
                });
                // 6) Aquí podrías recargar tu tabla via tablaMisCasos.js si la tienes AJAX
            } else {
                // manejar error devuelto
                Swal.fire('Error', json.message || 'Algo falló', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo conectar al servidor', 'error');
        }
    });

    // —————— Función helper para el badge ——————
    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
