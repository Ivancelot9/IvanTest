document.getElementById('formMetodo')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    try {
        const res = await fetch('../dao/guardarMetodoTrabajo.php', {
            method: 'POST',
            body: data
        });

        const json = await res.json();

        if (json.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Método de trabajo subido correctamente',
                timer: 2000,
                showConfirmButton: false
            });

            const archivo = form.querySelector('input[type="file"]').files[0];
            const nombre = json.filename || archivo.name;
            const contenedor = document.getElementById('preview-metodo-trabajo');

            if (contenedor) {
                contenedor.innerHTML = `
                    <iframe src="../dao/uploads/pdf/${encodeURIComponent(nombre)}"
                            width="100%" height="500px"
                            style="border:1px solid #ccc;"></iframe>
                `;
                form.style.display = 'none';
            }
        } else {
            Swal.fire('Error', json.message || 'No se pudo subir el archivo', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error al conectar con el servidor', 'error');
    }
});
