// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username     = document.body.dataset.username;
    const canalGlobal  = new BroadcastChannel('canal-casos');
    const btnHistorial = document.getElementById('btn-historial-casos');
    const badge        = btnHistorial.querySelector('.badge-count');
    const storageKey   = `adminNewCases_${username}`;
    let contador       = parseInt(localStorage.getItem(storageKey) || '0', 10);

    // Inicia badge
    actualizarBadge(contador);

    // Escucha canal global
    canalGlobal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case' && data.from !== username) {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);

            // Insertar en tabla #historial-casos si existe
            const tbody = document.querySelector('#historial-casos .cases-table tbody');
            if (tbody && data.folio && data.fecha) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${data.folio}</td><td>${data.fecha}</td>` +
                    `<td><button class="show-desc">Mostrar descripción</button></td>`;
                tbody.prepend(tr);
                if (window.historialPaginador) window.historialPaginador.addRow(tr);
            }
        }
    });

    // Resetea badge al abrir la sección de admin
    btnHistorial.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(0);
    });

    function actualizarBadge(c) {
        if (c > 0) {
            badge.textContent = c;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
