// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username     = document.body.dataset.username;
    const canalGlobal  = new BroadcastChannel('canal-casos');
    const btnHistorial = document.getElementById('btn-historial-casos');
    const badgeAdmin   = btnHistorial.querySelector('.badge-count');
    const storageKeyA  = `adminNewCases_${username}`;
    let contadorAdmin  = parseInt(localStorage.getItem(storageKeyA) || '0', 10);

    actualizarBadgeAdmin(contadorAdmin);

    // Escuchar TODO new-case, sin filtrar by from
    canalGlobal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorAdmin++;
            localStorage.setItem(storageKeyA, contadorAdmin);
            actualizarBadgeAdmin(contadorAdmin);

            // Insertar en tabla #historial-casos
            const tbody = document.querySelector('#historial-casos .cases-table tbody');
            if (tbody && data.folio && data.fecha) {
                const tr = document.createElement('tr');
                tr.innerHTML =  `<td>${data.folio}</td>` +
                    `<td>${data.fecha}</td>` +
                    `<td>${data.estatus}</td>` +           // ← ahora el texto
                    `<td>${data.responsable}</td>` +
                    `<td>${data.terciaria}</td>` +
                    `<td><button class="show-desc">Mostrar descripción</button></td>`; // Descripción
                tbody.prepend(tr);
                if (window.historialPaginador) window.historialPaginador.addRow(tr);
            }
        }
    });

    // Reset badge al abrir sección admin
    btnHistorial.addEventListener('click', () => {
        contadorAdmin = 0;
        localStorage.setItem(storageKeyA, '0');
        actualizarBadgeAdmin(0);
    });

    function actualizarBadgeAdmin(c) {
        if (c > 0) {
            badgeAdmin.textContent = c;
            badgeAdmin.style.display = 'inline-block';
        } else {
            badgeAdmin.style.display = 'none';
        }
    }
});
