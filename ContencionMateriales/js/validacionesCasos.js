// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.data-form');

    // IDs de todos los campos obligatorios (inputs y selects)
    const camposRequeridos = [
        'responsable',
        'no-parte',
        'cantidad',
        'terciaria',
        'proveedor',
        'commodity',
        'defectos'
    ];

    formulario.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Validación de todos los campos “requeridos” con SweetAlert
        for (const id of camposRequeridos) {
            const el = document.getElementById(id);
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

        // 2) Validación de Responsable (solo letras y espacios)
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

        // 3) Validación de Número de Parte (letras, números, guiones)
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

        // 4) Validación de Cantidad (mayor que 0, hasta 3 decimales)
        const cantidadInput = document.getElementById('cantidad');
        const cantidadStr = cantidadInput.value.trim();
        const cantidadNum = parseFloat(cantidadStr.replace(',', '.'));
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

        // 5) Validación de Fotos OK / NO OK
        const archivos = Array.from(formulario.querySelectorAll('input[type="file"]'));
        const tieneOk = archivos.filter(i => i.name === 'fotosOk[]').some(i => i.files.length > 0);
        const tieneNo = archivos.filter(i => i.name === 'fotosNo[]').some(i => i.files.length > 0);
        if (!tieneOk || !tieneNo) {
            await Swal.fire({
                icon: 'warning',
                title: 'Faltan fotos',
                html: `
                    ${!tieneOk ? '&bull; Debes subir al menos una foto <strong>OK</strong>.<br>' : ''}
                    ${!tieneNo ? '&bull; Debes subir al menos una foto <strong>NO OK</strong>.' : ''}
                `
            });
            return;
        }

        // 6) Feedback de envío
        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // 7) Envío con todos los archivos ya dentro del <form>
        const fd = new FormData(formulario);
        try {
            const res = await fetch(formulario.action, { method: 'POST', body: fd });
            const json = await res.json();
            Swal.close();

            if (json.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Caso guardado!',
                    text: json.message
                });

                formulario.reset();
                document.getElementById('evidencia-preview').innerHTML = '';

                // 7.1) Insertar el nuevo caso en la tabla de #historial
                const tablaHistorial = document.querySelector('#historial .cases-table tbody');
                if (tablaHistorial && json.folio && json.fecha) {
                    const nuevaFila = document.createElement('tr');
                    nuevaFila.innerHTML = `
                        <td>${json.folio}</td>
                        <td>${json.fecha}</td>
                        <td><button class="show-desc">Mostrar descripción</button></td>
                    `;
                    tablaHistorial.prepend(nuevaFila); // lo coloca al inicio

                    // Vuelve a aplicar paginación (recontar y mostrar)
                    inicializarTablaCasos('#historial');
                }

            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: json.message
                });
            }

        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo conectar con el servidor.'
            });
        }
    });

    // --- Funciones auxiliares para marcar/quitar estilo de error ---
    function marcarError(el) {
        el.classList.add('input-error');
    }
    function quitarError(el) {
        el.classList.remove('input-error');
    }
});
