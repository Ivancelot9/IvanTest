// modalEnviarCorreos.js
// Requiere SweetAlert2 (Swal.fire) y tu función enviarCorreo(folios: string[], email: string): Promise

document.addEventListener('DOMContentLoaded', () => {
    // 1) Inyectar el HTML del modal
    const html = `
    <div id="modal-enviar">
      <div class="backdrop"></div>
      <div class="content">
        <header>
          <h2>Confirma Casos a Enviar</h2>
          <button class="close-btn" id="modal-close">×</button>
        </header>
        <section>
          <div id="cards-container" class="cards-container"></div>
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

    // 2) Referencias
    const modal        = document.getElementById('modal-enviar');
    const backdrop     = modal.querySelector('.backdrop');
    const btnClose     = document.getElementById('modal-close');
    const btnCancel    = document.getElementById('modal-cancel');
    const btnSend      = document.getElementById('modal-send');
    const cardsContainer = document.getElementById('cards-container');
    const inpEmail     = document.getElementById('email-destino');
    const toggleBtn    = document.getElementById('btn-toggle-seleccion');

    // 3) Abrir / cerrar modal
    function openModal() {
        cardsContainer.innerHTML = '';
        const folios = Array.from(document.querySelectorAll('.check-folio:checked'))
            .map(cb => cb.value);

        if (folios.length === 0) {
            Swal.fire('Atención','No has seleccionado ningún caso.','warning');
            return;
        }

        // Crear “carta” por cada folio
        folios.forEach(folio => {
            const card = document.createElement('div');
            card.className = 'folio-card';
            const title = document.createElement('h4');
            title.textContent = `Folio ${folio}`;
            const btnX = document.createElement('button');
            btnX.textContent = '×';
            btnX.className = 'remove-folio';
            btnX.addEventListener('click', () => card.remove());
            card.appendChild(title);
            card.appendChild(btnX);
            cardsContainer.appendChild(card);
        });

        inpEmail.value = '';
        modal.style.display = 'block';
    }
    function closeModal() {
        modal.style.display = 'none';
    }

    backdrop.addEventListener('click', closeModal);
    btnClose .addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // 4) Capturar segundo click (“✅ Confirmar envío”)
    toggleBtn.addEventListener('click', function(e) {
        if ( this.textContent.startsWith('✅') ) {
            const marked = document.querySelectorAll('.check-folio:checked');
            if (marked.length === 0) {
                Swal.fire('Atención','Marca al menos un caso.','warning');
            } else {
                openModal();
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    // 5) Envío definitivo
    btnSend.addEventListener('click', () => {
        const folios = Array.from(cardsContainer.children)
            .map(card => card.querySelector('h4').textContent.replace('Folio ', ''));
        const email = inpEmail.value.trim();
        if (!/.+@.+\..+/.test(email)) {
            Swal.fire('Error','Ingresa un correo válido.','error');
            return;
        }
        enviarCorreo(folios, email)
            .then(() => {
                Swal.fire('Éxito','Correos enviados correctamente.','success');
                closeModal();
                toggleBtn.click(); // volver al estado inicial
            })
            .catch(err => {
                Swal.fire('Error','Falló el envío: ' + err.message,'error');
            });
    });
});
