// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username    = document.body.dataset.username;
    const canal       = new BroadcastChannel(`casosChannel_${username}`);
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge       = btnMisCasos.querySelector('.badge-count');
    const storageKey  = `newCasesCount_${username}`;
    let contador      = parseInt(localStorage.getItem(storageKey) || '0', 10);

    // Inicializa badge
    actualizarBadge(contador);

    // Escucha notificaciones (mismo usuario en otras pestañas)
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // Al hacer click en “Mis casos” resetea el badge
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(contador);
        // aquí tu lógica para mostrar #historial…
    });

    // Único handler de submit
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Validar campos requeridos
        const campos = ['responsable','no-parte','cantidad','terciaria','proveedor','commodity','defectos'];
        for (const id of campos) {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                marcarError(el);
                await Swal.fire('Campo requerido', `Completa "${el.previousElementSibling.innerText}"`, 'warning');
                quitarError(el);
                el.focus();
                return;
            }
        }

        // 2) (Aquí agrégalas—responsable, parte, cantidad, fotos—sin duplicar…)

        // 3) Feedback de carga
        Swal.fire({ title:'Guardando caso…', allowOutsideClick:false, didOpen:()=>Swal.showLoading() });

        // 4) Envío AJAX
        try {
            const resp = await fetch(form.action, { method:'POST', body:new FormData(form) });
            // cerrar loader antes de parsear
            Swal.close();

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();

            if (json.status === 'success') {
                // 5) Notificar **una** vez
                canal.postMessage({ type:'new-case', folio: json.folio });
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // 6) Reset UI
                form.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                // 7) Insertar en tabla “Mis casos”
                const tbody = document.querySelector('#historial .cases-table tbody');
                if (tbody && json.folio && json.fecha) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${json.folio}</td><td>${json.fecha}</td><td><button class="show-desc">Mostrar descripción</button></td>`;
                    tbody.prepend(tr);
                    if (window.historialPaginador) window.historialPaginador.addRow(tr);
                }

                // 8) Mensaje final
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

    // — Helpers —
    function actualizarBadge(c) {
        if (c > 0) {
            badge.textContent = c;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    function marcarError(el) { el.classList.add('input-error'); }
    function quitarError(el) { el.classList.remove('input-error'); }
});
