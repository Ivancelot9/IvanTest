// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username    = document.body.dataset.username;
    const canal       = new BroadcastChannel(`casosChannel_${username}`);  // canal individual
    const canalGlobal = new BroadcastChannel('canal-casos');              // canal global para admin
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge       = btnMisCasos.querySelector('.badge-count');
    const storageKey  = `newCasesCount_${username}`;
    let contador      = parseInt(localStorage.getItem(storageKey) || '0', 10);

    // Inicia badge
    actualizarBadge(contador);

    // Escucha notificaciones en el canal individual
    canal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem(storageKey, contador);
            actualizarBadge(contador);
        }
    });

    // Resetea badge al hacer clic en “Mis casos”
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadge(0);
        // aquí tu lógica para mostrar #historial…
    });

    // Handler único de submit (validaciones + AJAX + notificaciones)
    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Campos requeridos
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

        // 2) Validación Responsable
        const responsable = document.getElementById('responsable').value.trim();
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(responsable)) {
            const el = document.getElementById('responsable');
            marcarError(el);
            await Swal.fire('Responsable inválido', 'El nombre solo puede contener letras y espacios.', 'error');
            quitarError(el);
            el.focus();
            return;
        }

        // 3) Validación Número de Parte
        const numParte = document.getElementById('no-parte').value.trim();
        if (!/^[A-Za-z0-9-]+$/.test(numParte)) {
            const el = document.getElementById('no-parte');
            marcarError(el);
            await Swal.fire('Número de parte inválido', 'Solo se permiten letras, números y guiones medios.', 'error');
            quitarError(el);
            el.focus();
            return;
        }

        // 4) Validación Cantidad
        const cantidadInput = document.getElementById('cantidad');
        const cantidadStr   = cantidadInput.value.trim();
        const cantidadNum   = parseFloat(cantidadStr.replace(',', '.'));
        if (!/^[0-9]+([.,][0-9]{1,3})?$/.test(cantidadStr) || isNaN(cantidadNum) || cantidadNum <= 0) {
            marcarError(cantidadInput);
            await Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                html: `Debe ser un número mayor que 0.<br>Puedes usar hasta 3 decimales (ej. 1.2, 1.00, 1.567).`
            });
            quitarError(cantidadInput);
            cantidadInput.focus();
            return;
        }

        // 5) Validación Fotos OK / NO OK
        const archivos = Array.from(form.querySelectorAll('input[type="file"]'));
        const tieneOk  = archivos.filter(i => i.name==='fotosOk[]').some(i => i.files.length>0);
        const tieneNo  = archivos.filter(i => i.name==='fotosNo[]').some(i => i.files.length>0);
        if (!tieneOk || !tieneNo) {
            await Swal.fire({
                icon: 'warning',
                title: 'Faltan fotos',
                html: `${!tieneOk ? '&bull; Debes subir al menos una foto <strong>OK</strong>.<br>' : ''}` +
                    `${!tieneNo ? '&bull; Debes subir al menos una foto <strong>NO OK</strong>.' : ''}`
            });
            return;
        }

        // 6) Feedback de carga
        Swal.fire({ title:'Guardando caso…', allowOutsideClick:false, didOpen:()=>Swal.showLoading() });

        // 7) Envío AJAX
        try {
            const resp = await fetch(form.action, { method:'POST', body:new FormData(form) });
            Swal.close();
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();

            if (json.status === 'success') {
                // Notificar al canal individual
                canal.postMessage({ type:'new-case', folio: json.folio });
                // Notificar al canal global (admin)
                canalGlobal.postMessage({ type:'new-case', folio: json.folio, from: username });

                // Actualiza badge local
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // Reset UI
                form.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                // Insertar en tabla “Mis casos”
                const tbody = document.querySelector('#historial .cases-table tbody');
                if (tbody && json.folio && json.fecha) {
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

    // Helpers
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
