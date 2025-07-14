document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-subir-metodo');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = new FormData(form);
        try {
            const res = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (json.status === 'success') {
                alert("PDF subido correctamente. Recargando...");
                location.reload();
            } else {
                alert("Error: " + json.message);
            }
        } catch (err) {
            alert("Error al subir el PDF.");
            console.error(err);
        }
    });
});
