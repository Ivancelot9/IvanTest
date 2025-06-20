// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username     = document.body.dataset.username;
    const canalGlobal  = new BroadcastChannel('canal-casos');
    const btnHistorial = document.getElementById('btn-historial-casos');
    let badgeAdmin = null;
    if (btnHistorial) {
        badgeAdmin = btnHistorial.querySelector('.badge-count');
    } else {
        console.warn('⚠️ No se encontró #btn-historial-casos en el DOM');
    }
    const storageKeyA  = `adminNewCases_${username}`;
    let contadorAdmin  = parseInt(localStorage.getItem(storageKeyA) || '0', 10);

    actualizarBadgeAdmin(contadorAdmin);

    // Escuchar TODO new-case, sin filtrar by from
    canalGlobal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorAdmin++;
            localStorage.setItem(storageKeyA, contadorAdmin);
            actualizarBadgeAdmin(contadorAdmin);

            // Insertar en #historial-casos (6 columnas)
            const tbody = document.querySelector('#historial-casos .cases-table tbody');
            if (tbody && data.folio && data.fecha) {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${data.folio}</td>` +
                    `<td>${data.fecha}</td>` +
                    `<td>${data.estatus}</td>` +
                    `<td>${data.responsable}</td>` +
                    `<td>${data.terciaria}</td>` +
                    `<td><button class="show-desc" data-folio="${data.folio}">Mostrar descripción</button></td>`;
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
