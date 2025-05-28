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

    // Único handler de submit: valida, envía, notifica y actualiza UI
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // --- Validaciones (campos, responsable, parte, cantidad, fotos) ---
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
        // ... tus otras validaciones aquí sin duplicar ...

        // Feedback de carga
        Swal.fire({ title:'Guardando caso…', allowOutsideClick:false, didOpen:() => Swal.showLoading() });

        // Envío AJAX
        try {
            const resp = await fetch(form.action, { method:'POST', body:new FormData(form) });
            const json = await resp.json();
            Swal.close();

            if (json.status === 'success') {
                // Notificar solo una vez
                canal.postMessage({ type:'new-case', folio: json.folio });
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // Reset UI
                form.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                // Insertar en tabla “Mis casos”
                const tbody = document.querySelector('#historial .cases-table tbody');
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${json.folio}</td><td>${json.fecha}</td><td><button class="show-desc">Mostrar descripción</button></td>`;
                    tbody.prepend(tr);
                    if (window.historialPaginador) window.historialPaginador.addRow(tr);
                }

                await Swal.fire('¡Caso guardado!', json.message, 'success');
            } else {
                await Swal.fire('Error', json.message||'Algo salió mal','error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo conectar con el servidor','error');
        }
    });

    // Helpers
    function actualizarBadge(c) {
        if (c > 0) {
            badge.textContent = c;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    function marcarError(el){ el.classList.add('input-error'); }
    function quitarError(el){ el.classList.remove('input-error'); }
});
