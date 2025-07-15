document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formMetodo');
    const preview = document.getElementById('preview-metodo-trabajo');

    if (!form) return;

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
                return Swal.fire('Error','Respuesta inválida del servidor','error');
            }

            if (json.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Mostrar el iframe sin recargar
                const filename = json.filename;
                preview.innerHTML = `
          <iframe
            src="../dao/uploads/pdf/${encodeURIComponent(filename)}"
            width="100%" height="500px"
            style="border:1px solid #ccc; border-radius:6px;"
          ></iframe>
        `;
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
