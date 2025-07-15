document.addEventListener('DOMContentLoaded', () => {
    const form      = document.getElementById('formMetodo');
    const preview   = document.getElementById('preview-metodo-trabajo');
    const fileInput = form?.querySelector('input[type="file"]');
    const nameDisplay = document.createElement('div');

    if (!form || !fileInput) return;

    // Estilo para el nombre de archivo
    nameDisplay.style.margin = '0.5rem 0';
    nameDisplay.style.fontStyle = 'italic';
    form.insertBefore(nameDisplay, form.querySelector('button'));

    // 1) Previsualizar PDF al seleccionarlo
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
            preview.innerHTML = '';
            nameDisplay.textContent = '';
            return;
        }
        const url = URL.createObjectURL(file);
        preview.innerHTML = `
      <iframe
        src="${url}"
        width="100%" height="300px"
        style="border:1px solid #ccc; border-radius:6px;"
      ></iframe>
    `;
        nameDisplay.textContent = `Archivo: ${file.name}`;
    });

    // 2) Enviar al servidor y confirmar con SweetAlert
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const data = new FormData(form);
        try {
            const res = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch {
                console.error('Respuesta inválida:', text);
                return Swal.fire('Error','El servidor no devolvió JSON','error');
            }

            if (json.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Ya está previsualizado, solo ocultamos el formulario
                form.style.display = 'none';
            } else {
                Swal.fire('Error', json.message || 'No se pudo subir el archivo','error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error','Error de conexión con el servidor','error');
        }
    });
});
