document.getElementById('formMetodo')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const res = await fetch('../dao/guardarMetodoTrabajo.php', {
        method: 'POST',
        body: data
    });

    const json = await res.json();
    if (json.status === 'success') {
        alert('PDF subido correctamente.');
        location.reload();
    } else {
        document.getElementById('estadoSubida').innerText = json.message || 'Error al subir.';
    }
});