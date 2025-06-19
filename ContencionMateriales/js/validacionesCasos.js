document.addEventListener('DOMContentLoaded', () => {
    const username    = document.body.dataset.username;
    const canalLocal  = new BroadcastChannel(`casosChannel_${username}`);
    const canalGlobal = new BroadcastChannel('canal-casos');
    const btnMisCasos = document.getElementById('btn-mis-casos');
    let badgeLocal    = btnMisCasos?.querySelector('.badge-count') || null;
    const storageKey  = `newCasesCount_${username}`;
    let contadorLocal = parseInt(localStorage.getItem(storageKey) || '0', 10);
    actualizarBadgeLocal(contadorLocal);

    canalLocal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);
        }
    });

    btnMisCasos?.addEventListener('click', () => {
        contadorLocal = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadgeLocal(0);
        // Mostrar sección #historial…
    });

    const form = document.querySelector('form.data-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Validación de campos generales
        const responsable = form.Responsable.value.trim();
        const numeroParte = form.NumeroParte.value.trim();
        const cantidad    = form.Cantidad.value.trim();
        const descripcion = form.Descripcion.value.trim();
        const idTerceria  = form.IdTerceria.value;
        const idProveedor = form.IdProveedor.value;
        const idCommodity = form.IdCommodity.value;

        if (!responsable || !numeroParte || !cantidad || !descripcion ||
            !idTerceria || !idProveedor || !idCommodity) {
            return Swal.fire('Error', 'Por favor completa todos los datos generales.', 'error');
        }

        // 2) Validar bloques de defectos
        const bloques = document.querySelectorAll('.bloque-defecto');
        if (bloques.length === 0) {
            return Swal.fire('Error', 'Agrega al menos un defecto con sus dos fotos.', 'error');
        }
        for (let i = 0; i < bloques.length; i++) {
            const bloque = bloques[i];
            const sel  = bloque.querySelector('select');
            const ok   = bloque.querySelector('input[type="file"][name*="[fotoOk]"]');
            const no   = bloque.querySelector('input[type="file"][name*="[fotoNo]"]');

            if (!sel.value) {
                return Swal.fire('Error', `Selecciona el defecto en el bloque ${i + 1}.`, 'error');
            }
            if (!ok.files.length) {
                return Swal.fire('Error', `Agrega la foto OK en el bloque ${i + 1}.`, 'error');
            }
            if (!no.files.length) {
                return Swal.fire('Error', `Agrega la foto NO OK en el bloque ${i + 1}.`, 'error');
            }
        }

        // 3) Si todo OK, seguimos con el envío
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

            // Si hay error 500 (u otro), leer el body en texto
            if (!resp.ok) {
                const text = await resp.text();
                Swal.close();
                console.error('SERVER ERROR:', text);
                return Swal.fire('Error interno', text, 'error');
            }

            // Cerrar el loading y parsear el JSON
            Swal.close();
            const json = await resp.json();
            if (json.status !== 'success') {
                throw new Error(json.message || 'Error inesperado');
            }

            // … resto de tu lógica de notificaciones …
            canalLocal.postMessage({ type: 'new-case', folio: json.folio });
            canalGlobal.postMessage({
                type:        'new-case',
                folio:       json.folio,
                fecha:       json.fecha,
                estatus:     json.estatus,
                responsable: json.responsable,
                terciaria:   json.terciaria,
                from:        username
            });

            // Actualizar badge y limpiar UI
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);
            form.reset();
            document.getElementById('evidencia-preview').innerHTML = '';

            // Añadir fila a “Mis Casos”
            const tbody = document.querySelector('#historial .cases-table tbody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${json.folio}</td>` +
                    `<td>${json.fecha}</td>` +
                    `<td>${json.estatus}</td>` +
                    `<td><button class="show-desc" data-folio="${json.folio}">Mostrar descripción</button></td>`;
                tbody.prepend(tr);
                window.historialPaginador?.addRow(tr);
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
