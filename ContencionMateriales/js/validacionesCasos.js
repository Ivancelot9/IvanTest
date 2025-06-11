// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username       = document.body.dataset.username;
    const canalLocal     = new BroadcastChannel(`casosChannel_${username}`);
    const canalGlobal    = new BroadcastChannel('canal-casos');
    const btnMisCasos    = document.getElementById('btn-mis-casos');
    const badgeLocal     = btnMisCasos.querySelector('.badge-count');
    const storageKey     = `newCasesCount_${username}`;
    let contadorLocal    = parseInt(localStorage.getItem(storageKey) || '0', 10);

    actualizarBadgeLocal(contadorLocal);

    canalLocal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);
        }
    });

    btnMisCasos.addEventListener('click', () => {
        contadorLocal = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadgeLocal(0);
        // Aquí muestras la sección #historial
    });

    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // … (tus validaciones previas) …

        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });
            Swal.close();
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const json = await resp.json();
            if (json.status !== 'success') {
                throw new Error(json.message || 'Error inesperado');
            }

            // Notificar nuevos casos
            canalLocal.postMessage({ type: 'new-case', folio: json.folio });
            canalGlobal.postMessage({
                type:        'new-case',
                folio:       json.folio,
                fecha:       json.fecha,
                estatus:     json.estatus,      // “En Proceso”
                responsable: json.responsable,  // tu texto
                terciaria:   json.terciaria,    // tu texto
                from:        username
            });

            // Actualizar badge
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);

            // Limpiar UI
            form.reset();
            document.getElementById('evidencia-preview').innerHTML = '';

            // Insertar fila nueva en "Mis Casos"
            const tbody = document.querySelector('#historial .cases-table tbody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${data.folio}</td><td>${data.fecha}</td>` +
                    `<td>${data.estatus}</td>` +         // esto ya viene
                    `<td>${data.responsable}</td>` +     // esto será undefined sin el paso 1
                    `<td>${data.terciaria}</td>` +       // idem
                    `<td><button class="show-desc">Mostrar descripción</button></td>`;
                tbody.prepend(tr);
                if (window.historialPaginador) {
                    window.historialPaginador.addRow(tr);
                }
            }

            await Swal.fire('¡Caso guardado!', json.message, 'success');
        } catch (err) {
            console.error(err);
            Swal.close();
            Swal.fire('Error', err.message, 'error');
        }
    });

    function actualizarBadgeLocal(count) {
        if (count > 0) {
            badgeLocal.textContent = count;
            badgeLocal.style.display = 'inline-block';
        } else {
            badgeLocal.style.display = 'none';
        }
    }
});
