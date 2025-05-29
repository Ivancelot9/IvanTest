// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username    = document.body.dataset.username;
    const canalLocal  = new BroadcastChannel(`casosChannel_${username}`);
    const canalGlobal = new BroadcastChannel('canal-casos');
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badgeLocal  = btnMisCasos.querySelector('.badge-count');
    const storageKeyLocal = `newCasesCount_${username}`;
    let contadorLocal = parseInt(localStorage.getItem(storageKeyLocal) || '0', 10);

    actualizarBadgeLocal(contadorLocal);

    canalLocal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorLocal++;
            localStorage.setItem(storageKeyLocal, contadorLocal);
            actualizarBadgeLocal(contadorLocal);
        }
    });

    btnMisCasos.addEventListener('click', () => {
        contadorLocal = 0;
        localStorage.setItem(storageKeyLocal, '0');
        actualizarBadgeLocal(0);
        // mostrar sección #historial…
    });

    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // ... (todas tus validaciones como tenías) ...

        Swal.fire({ title:'Guardando caso…', allowOutsideClick:false, didOpen:()=>Swal.showLoading() });
        try {
            const resp = await fetch(form.action, { method:'POST', body:new FormData(form) });
            Swal.close();
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();

            if (json.status === 'success') {
                // Notificar sólo una vez en cada canal
                canalLocal.postMessage({ type:'new-case', folio: json.folio });
                canalGlobal.postMessage({
                    type:  'new-case',
                    folio: json.folio,
                    fecha: json.fecha,
                    from:  username
                });

                // actualizar badge local
                contadorLocal++;
                localStorage.setItem(storageKeyLocal, contadorLocal);
                actualizarBadgeLocal(contadorLocal);

                // reset UI y agregar fila en "Mis casos"
                form.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                const tbody = document.querySelector('#historial .cases-table tbody');
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${json.folio}</td><td>${json.fecha}</td>` +
                        `<td><button class="show-desc">Mostrar descripción</button></td>`;
                    tbody.prepend(tr);
                    if (window.historialPaginador) window.historialPaginador.addRow(tr);
                }

                await Swal.fire('¡Caso guardado!', json.message, 'success');
            } else {
                throw new Error(json.message || 'Error inesperado');
            }
        } catch (err) {
            console.error(err);
            Swal.close();
            Swal.fire('Error', err.message, 'error');
        }
    });

    function actualizarBadgeLocal(c) {
        if (c > 0) {
            badgeLocal.textContent = c;
            badgeLocal.style.display = 'inline-block';
        } else {
            badgeLocal.style.display = 'none';
        }
    }
});
