// subirMetodoTrabajoExterno.js

document.addEventListener('DOMContentLoaded', () => {
    const form        = document.getElementById('formMetodo');
    const fileInput   = document.getElementById('input-file');
    const nameDisplay = document.getElementById('file-name');
    const preview     = document.getElementById('preview-metodo-trabajo');

    if (!form || !fileInput || !nameDisplay || !preview) return;

    // 1) Mostrar nombre y previsualizar PDF al seleccionarlo
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
            nameDisplay.textContent = '';
            preview.innerHTML = '';
            return;
        }
        nameDisplay.textContent = `Archivo: ${file.name}`;
        const url = URL.createObjectURL(file);
        preview.innerHTML = `
      <iframe
        src="${url}"
        width="100%" height="300px"
        style="border:1px solid #ccc; border-radius:6px;"
      ></iframe>
    `;
    });

    // 2) Capturar envío y subir via AJAX con feedback
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // asegúrate de que haya un archivo antes de enviar
        if (fileInput.files.length === 0) {
            return Swal.fire('Error', 'Selecciona un PDF antes de enviar.', 'warning');
        }

        const data = new FormData(form);
        data.set('pdf', fileInput.files[0]); // añadir explícitamente el archivo

        try {
            const res  = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch {
                console.error('Respuesta inválida del servidor:', text);
                return Swal.fire('Error', 'El servidor no devolvió JSON válido.', 'error');
            }

            if (json.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                // Ocultar el formulario; la previsualización ya está en pantalla
                form.style.display = 'none';
            } else {
                Swal.fire('Error', json.message || 'No se pudo subir el archivo.', 'error');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            Swal.fire('Error', 'Hubo un problema de conexión con el servidor.', 'error');
        }
    });
});
