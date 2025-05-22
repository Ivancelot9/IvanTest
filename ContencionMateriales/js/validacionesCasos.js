document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.data-form');

    formulario.addEventListener('submit', e => {
        e.preventDefault(); // bloqueamos envío hasta validar todo

        // 1) Responsable: sólo letras, acentos y espacios
        const responsable = document.getElementById('responsable').value.trim();
        const regexResponsable = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
        if (!responsable || !regexResponsable.test(responsable)) {
            return Swal.fire({
                icon: 'error',
                title: 'Responsable inválido',
                text: 'El nombre del responsable sólo puede contener letras y espacios.'
            });
        }

        // 2) Número de parte: letras, dígitos y guión medio
        const numParte = document.getElementById('no-parte').value.trim();
        const regexParte = /^[A-Za-z0-9-]+$/;
        if (!numParte || !regexParte.test(numParte)) {
            return Swal.fire({
                icon: 'error',
                title: 'Número de parte inválido',
                text: 'Sólo se permiten letras, números y guiones medios (–).'
            });
        }

        // 3) Cantidad: número > 0 (decimales permitidos)
        const cantidadStr = document.getElementById('cantidad').value.trim();
        const cantidad = parseFloat(cantidadStr.replace(',', '.'));
        if (!cantidadStr || isNaN(cantidad) || cantidad <= 0) {
            return Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                text: 'La cantidad debe ser un número mayor que cero (puedes usar decimales).'
            });
        }

        // 4) Campos obligatorios: selects
        const selects = ['terciaria','proveedor','commodity','defectos'];
        for (let id of selects) {
            const valor = document.getElementById(id).value;
            if (!valor) {
                const texto = document.querySelector(`label[for="${id}"]`).innerText;
                return Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: `Debes seleccionar una opción para "${texto}".`
                });
            }
        }

        // ——— Validación de fotos ———
        const fotoOkPrincipal = document.getElementById("foto-ok");
        const fotosOkExtras   = Array.from(
            document.querySelectorAll("#fotos-ok-extra-container input[type=file]")
        );
        const todasOk         = [fotoOkPrincipal, ...fotosOkExtras];

        const fotoNoPrincipal = document.getElementById("foto-no-ok");
        const fotosNoExtras   = Array.from(
            document.querySelectorAll("#fotos-no-extra-container input[type=file]")
        );
        const todasNo         = [fotoNoPrincipal, ...fotosNoExtras];

        const tieneOk = todasOk.some(i => i.files.length > 0);
        const tieneNo = todasNo.some(i => i.files.length > 0);

        if (!tieneOk || !tieneNo) {
            return Swal.fire({
                icon: "warning",
                title: "Faltan fotos",
                html: `
          ${!tieneOk ? "• Debes subir al menos una foto <strong>OK</strong>.<br>" : ""}
          ${!tieneNo ? "• Debes subir al menos una foto <strong>NO OK</strong>." : ""}
        `,
                confirmButtonText: "Entendido"
            });
        }
        // ——— Fin validación de fotos ———

        // Si todas las validaciones pasaron → enviamos el formulario
        formulario.submit();
    });
});
