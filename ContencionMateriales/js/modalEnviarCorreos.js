// modalEnviarCorreos.js
// Requiere SweetAlert2 (Swal.fire) y tu función enviarCorreo(folios, email)

document.addEventListener('DOMContentLoaded', () => {
    // 1) Inyectar el HTML del modal en el body
    const html = `
    <div id="modal-enviar">
      <div class="backdrop"></div>
      <div class="content">
        <header>
          <h2>Confirma Casos a Enviar</h2>
          <button class="close-btn" id="modal-close">×</button>
        </header>
        <section>
          <ul id="lista-folios"></ul>
          <label for="email-destino">Correo destino:</label>
          <input type="email" id="email-destino" placeholder="correo@ejemplo.com">
        </section>
        <footer>
          <button id="modal-send">📤 Enviar</button>
          <button id="modal-cancel">Cancelar</button>
        </footer>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    // 2) Referencias a elementos
    const modal    = document.getElementById('modal-enviar');
    const backdrop = modal.querySelector('.backdrop');
    const btnClose = document.getElementById('modal-close');
    const btnCancel= document.getElementById('modal-cancel');
    const btnSend  = document.getElementById('modal-send');
    const ulFolios = document.getElementById('lista-folios');
    const inpEmail = document.getElementById('email-destino');
    const toggleBtn= document.getElementById('btn-toggle-seleccion');

    // 3) Abrir el modal con los folios seleccionados
    function openModal() {
        ulFolios.innerHTML = '';
        const folios = Array.from(document.querySelectorAll('.check-folio:checked'))
            .map(cb => cb.value);
        if (folios.length === 0) {
            Swal.fire('Atención','No has seleccionado ningún caso.','warning');
            return;
        }
        folios.forEach(f => {
            const li = document.createElement('li');
            li.dataset.folio = f;
            li.textContent = `Folio ${f}`;
            const btnX = document.createElement('button');
            btnX.textContent = '×';
            btnX.className = 'remove-folio';
            btnX.addEventListener('click', () => li.remove());
            li.appendChild(btnX);
            ulFolios.appendChild(li);
        });
        inpEmail.value = '';
        modal.style.display = 'block';
    }

    // 4) Cerrar modal
    function closeModal() {
        modal.style.display = 'none';
    }
    backdrop.addEventListener('click', closeModal);
    btnClose .addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // 5) Integración con el botón “Confirmar envío”
    toggleBtn.addEventListener('click', () => {
        // si ya estamos en modo selección (texto “✅ Confirmar envío”), abrimos el modal
        if (toggleBtn.textContent.startsWith('✅')) {
            openModal();
        }
    });

    // 6) Envío definitivo
    btnSend.addEventListener('click', () => {
        const folios = Array.from(ulFolios.children).map(li => li.dataset.folio);
        const email  = inpEmail.value.trim();
        if (!/.+@.+\..+/.test(email)) {
            Swal.fire('Error','Ingresa un correo válido.','error');
            return;
        }
        enviarCorreo(folios, email)
            .then(() => {
                Swal.fire('Éxito','Correos enviados correctamente.','success');
                closeModal();
                // desactivar modo selección:
                toggleBtn.click();
            })
            .catch(err => {
                Swal.fire('Error','Falló el envío: ' + err.message,'error');
            });
    });
});
