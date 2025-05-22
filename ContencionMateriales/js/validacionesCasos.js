document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.data-form');

    formulario.addEventListener('submit', e => {
        e.preventDefault(); // bloqueamos el envío normal

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
        const cantidadStr = document.getElementById('cantidad').value.trim();
        const cantidad = parseFloat(cantidadStr.replace(',', '.'));
        if (!cantidadStr || isNaN(cantidad) || cantidad <= 0) {
            return Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                text: 'La cantidad debe ser un número mayor que cero (puedes usar decimales).'
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
        const fotosOk = [
            document.getElementById("foto-ok"),
            ...document.querySelectorAll("#fotos-ok-extra-container input[type=file]")
        ];
        const fotosNo = [
            document.getElementById("foto-no-ok"),
            ...document.querySelectorAll("#fotos-no-extra-container input[type=file]")
        ];
        const tieneOk = fotosOk.some(i => i.files.length > 0);
        const tieneNo = fotosNo.some(i => i.files.length > 0);
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

        // —— TODO OK: enviamos por AJAX ——
        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const fd = new FormData(formulario);
        fetch(formulario.action, {
            method: 'POST',
            body: fd
        })
            .then(res => res.json())
            .then(json => {
                if (json.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Caso guardado!',
                        text: json.message
                    });
                    // limpiar form + previews
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
