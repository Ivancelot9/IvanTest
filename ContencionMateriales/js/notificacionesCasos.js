// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const username       = document.body.dataset.username;
    const canal          = new BroadcastChannel(`casosChannel_${username}`);
    const btnMisCasos    = document.getElementById('btn-mis-casos');
    const badge          = btnMisCasos.querySelector('.badge-count');
    const storageKey     = `newCasesCount_${username}`;
    let contador         = parseInt(localStorage.getItem(storageKey) || '0', 10);

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
        // aquí tu lógica para mostrar la sección #historial…
    });

    // Intercepta submit, valida, envía por AJAX y notifica
    const formulario = document.querySelector('form.data-form');
    formulario.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Campos requeridos
        const camposRequeridos = [
            'responsable','no-parte','cantidad',
            'terciaria','proveedor','commodity','defectos'
        ];
        for (const id of camposRequeridos) {
            const el    = document.getElementById(id);
            const valor = el.value.trim();
            if (!valor) {
                marcarError(el);
                const texto = document.querySelector(`label[for="${id}"]`).innerText;
                await Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: `Por favor completa el campo "${texto}".`
                });
                quitarError(el);
                el.focus();
                return;
            }
        }

        // 2) Responsable solo letras y espacios
        const responsable = document.getElementById('responsable').value.trim();
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(responsable)) {
            const el = document.getElementById('responsable');
            marcarError(el);
            await Swal.fire({
                icon: 'error',
                title: 'Responsable inválido',
                text: 'El nombre solo puede contener letras y espacios.'
            });
            quitarError(el);
            el.focus();
            return;
        }

        // 3) Número de parte alfanumérico y guiones
        const numParte = document.getElementById('no-parte').value.trim();
        if (!/^[A-Za-z0-9-]+$/.test(numParte)) {
            const el = document.getElementById('no-parte');
            marcarError(el);
            await Swal.fire({
                icon: 'error',
                title: 'Número de parte inválido',
                text: 'Solo se permiten letras, números y guiones medios.'
            });
            quitarError(el);
            el.focus();
            return;
        }

        // 4) Cantidad >0 con hasta 3 decimales
        const cantidadInput = document.getElementById('cantidad');
        const cantidadStr   = cantidadInput.value.trim();
        const cantidadNum   = parseFloat(cantidadStr.replace(',', '.'));
        if (
            !/^[0-9]+([.,][0-9]{1,3})?$/.test(cantidadStr) ||
            isNaN(cantidadNum) ||
            cantidadNum <= 0
        ) {
            marcarError(cantidadInput);
            await Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                html: `
                    Debe ser un número mayor que 0.<br>
                    Puedes usar hasta 3 decimales (ej. 1.2, 1.00, 1.567).
                `
            });
            quitarError(cantidadInput);
            cantidadInput.focus();
            return;
        }

        // 5) Fotos OK / NO OK mínimo 1 cada una
        const archivos = Array.from(formulario.querySelectorAll('input[type="file"]'));
        const tieneOk  = archivos
            .filter(i => i.name === 'fotosOk[]')
            .some(i => i.files.length > 0);
        const tieneNo  = archivos
            .filter(i => i.name === 'fotosNo[]')
            .some(i => i.files.length > 0);
        if (!tieneOk || !tieneNo) {
            await Swal.fire({
                icon: 'warning',
                title: 'Faltan fotos',
                html: `
                    ${!tieneOk ? '&bull; Debes subir al menos una foto <strong>OK</strong>.<br>' : ''}
                    ${!tieneNo ? '&bull; Debes subir al menos una foto <strong>NO OK</strong>.' : ''}
                `
            });
            return;
        }

        // 6) Feedback de carga
        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // 7) Envío AJAX
        const fd = new FormData(formulario);
        try {
            const res  = await fetch(formulario.action, {
                method: 'POST',
                body: fd
            });
            const json = await res.json();
            Swal.close();

            if (json.status === 'success') {
                // 8) Notificar y actualizar badge
                canal.postMessage({ type: 'new-case', folio: json.folio });
                contador++;
                localStorage.setItem(storageKey, contador);
                actualizarBadge(contador);

                // 9) Reset form y preview
                formulario.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                // 10) Insertar en tabla “Mis casos” si existe
                const tablaHistorial = document.querySelector('#historial .cases-table tbody');
                if (tablaHistorial && json.folio && json.fecha) {
                    const nuevaFila = document.createElement('tr');
                    nuevaFila.innerHTML = `
                        <td>${json.folio}</td>
                        <td>${json.fecha}</td>
                        <td><button class="show-desc">Mostrar descripción</button></td>
                    `;
                    tablaHistorial.prepend(nuevaFila);
                    if (window.historialPaginador) {
                        window.historialPaginador.addRow(nuevaFila);
                    }
                }

                // 11) Mensaje final
                await Swal.fire({
                    icon: 'success',
                    title: '¡Caso guardado!',
                    text: json.message
                });
            } else {
                await Swal.fire('Error', json.message || 'Algo salió mal', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
    });

    // Helper: mostrar / ocultar badge
    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Helpers de estilo de error
    function marcarError(el) { el.classList.add('input-error'); }
    function quitarError(el) { el.classList.remove('input-error'); }
});
