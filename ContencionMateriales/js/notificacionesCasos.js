// js/notificacionesCasos.js
// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const canal = new BroadcastChannel('casosChannel');
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge = btnMisCasos.querySelector('.badge-count');
    const usernameActual = document.body.dataset.username;

    let contador = parseInt(localStorage.getItem('newCasesCount') || '0', 10);
    actualizarBadge(contador);

    // <-- CAMBIO AQUÍ -->
    canal.addEventListener('message', (event) => {
        // extraemos explícitamente type y creador del mensaje
        const { type, creador } = event.data;

        if (type === 'new-case' && creador === usernameActual) {
            contador++;
            localStorage.setItem('newCasesCount', contador);
            actualizarBadge(contador);
        }
    });

    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem('newCasesCount', '0');
        actualizarBadge(contador);
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


/*
  ————————— Integración del envío de notificación —————————
  En el punto donde realmente confirmas y guardas el caso (por ejemplo,
  después de recibir la respuesta de tu AJAX o en el callback del formulario),
  añade algo como esto:

  const canal = new BroadcastChannel('casosChannel');
  canal.postMessage({
      type: 'new-case',
      folio: nuevoFolio,                     // opcional, si lo quieres usar
      creador: document.body.dataset.username
  });

  Así, cada cliente solo recibirá la notificación si
  data.creador === su propio username.
*/
