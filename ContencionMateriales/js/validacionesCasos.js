// js/validacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.data-form');

    formulario.addEventListener('submit', e => {
        e.preventDefault();

        // 0) Validación nativa HTML5 de campos required
        if (!formulario.checkValidity()) {
            formulario.reportValidity();
            return;
        }

        // —— 1) Responsable ——
        const responsable = document.getElementById('responsable').value.trim();
        const regexResponsable = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
        if (!responsable || !regexResponsable.test(responsable)) {
            return Swal.fire({
                icon: 'error',
                title: 'Responsable inválido',
                text: 'El nombre del responsable sólo puede contener letras y espacios.'
            });
        }

        // —— 2) Número de parte ——
        const numParte = document.getElementById('no-parte').value.trim();
        const regexParte = /^[A-Za-z0-9-]+$/;
        if (!numParte || !regexParte.test(numParte)) {
            return Swal.fire({
                icon: 'error',
                title: 'Número de parte inválido',
                text: 'Sólo se permiten letras, números y guiones medios.'
            });
        }

        // —— 3) Cantidad ——
        const cantidadInput = document.getElementById('cantidad');
        const cantidadStr   = cantidadInput.value;
        const cantidadNum   = parseFloat(cantidadStr.replace(',', '.'));
        const regexCantidad = /^[0-9]+([.,][0-9]{1,3})?$/;
        if (
            cantidadStr === '' ||
            !regexCantidad.test(cantidadStr) ||
            isNaN(cantidadNum) ||
            cantidadNum <= 0
        ) {
            return Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                html: `
          Debe ser un número mayor que 0.<br>
          Puedes usar hasta 3 decimales, por ejemplo:<br>
          <em>1.2, 1.00, 1.567</em>
        `
            });
        }

        // —— 4) Selects obligatorios ——
        const selects = ['terciaria','proveedor','commodity','defectos'];
        for (let id of selects) {
            if (!document.getElementById(id).value) {
                const texto = document.querySelector(`label[for="${id}"]`).innerText;
                return Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: `Debes seleccionar una opción para "${texto}".`
                });
            }
        }

        // —— 5) Fotos OK / NO OK ——
        //  Como ya movimos y ocultamos los inputs al <form>, basta con comprobar que haya archivos en ellos
        const allFileInputs = Array.from(formulario.querySelectorAll('input[type="file"]'));
        const tieneOk = allFileInputs
            .filter(i => i.name === 'fotosOk[]')
            .some(i => i.files.length > 0);
        const tieneNo = allFileInputs
            .filter(i => i.name === 'fotosNo[]')
            .some(i => i.files.length > 0);
        if (!tieneOk || !tieneNo) {
            return Swal.fire({
                icon: 'warning',
                title: 'Faltan fotos',
                html: `
          ${!tieneOk ? '• Debes subir al menos una foto <strong>OK</strong>.<br>' : ''}
          ${!tieneNo ? '• Debes subir al menos una foto <strong>NO OK</strong>.' : ''}
        `,
                confirmButtonText: 'Entendido'
            });
        }

        // —— 6) Feedback de envío ——
        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // —— 7) Preparamos FormData (captura todos los inputs, incluidos los file ocultos) ——
        const fd = new FormData(formulario);

        // —— 8) Enviamos por AJAX ——
        fetch(formulario.action, {
            method: 'POST',
            body: fd
        })
            .then(res => res.json())
            .then(json => {
                Swal.close();
                if (json.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Caso guardado!',
                        text: json.message
                    });
                    // Limpiar formulario y previews
                    formulario.reset();
                    document.getElementById('evidencia-preview').innerHTML = '';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar',
                        text: json.message
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de red',
                    text: 'No se pudo conectar con el servidor.'
                });
            });
    });
});
