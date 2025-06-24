// modalEnviarCorreos.js
// Requiere SweetAlert2 (Swal.fire) y tu función enviarCorreo(folios: string[], email: string): Promise

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    if (!toggleBtn) return;

    let injected = false;
    let modal, backdrop, btnClose, btnCancel, btnSend, cardsContainer, inpEmail;

    function injectModal() {
        const html = `
      <div id="modal-enviar">
        <div class="backdrop"></div>
        <div class="content">
          <header>
            <h2>Confirma Casos a Enviar</h2>
            <button class="close-btn" id="modal-close">×</button>
          </header>
          <section>
            <div class="cards-container" id="cards-container"></div>
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

        modal          = document.getElementById('modal-enviar');
        backdrop       = modal.querySelector('.backdrop');
        btnClose       = document.getElementById('modal-close');
        btnCancel      = document.getElementById('modal-cancel');
        btnSend        = document.getElementById('modal-send');
        cardsContainer = document.getElementById('cards-container');
        inpEmail       = document.getElementById('email-destino');

        backdrop.addEventListener('click', closeModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        btnSend.addEventListener('click', () => {
            const folios = Array.from(cardsContainer.children)
                .map(card => card.dataset.folio);
            const email = inpEmail.value.trim();
            if (!/.+@.+\..+/.test(email)) {
                Swal.fire('Error','Ingresa un correo válido.','error');
                return;
            }
            enviarCorreo(folios, email)
                .then(() => {
                    Swal.fire('Éxito','Correos enviados correctamente.','success');
                    closeModal();
                    toggleBtn.click(); // reset modo selección
                })
                .catch(err => {
                    Swal.fire('Error','Falló el envío: ' + err.message,'error');
                });
        });

        injected = true;
    }

    function openModal() {
        cardsContainer.innerHTML = '';
        const folios = Array.from(
            document.querySelectorAll('.check-folio:checked')
        ).map(cb => cb.value);

        folios.forEach(folio => {
            const card = document.createElement('div');
            card.className = 'folio-card';
            card.dataset.folio = folio;

            const h4 = document.createElement('h4');
            h4.textContent = `Folio ${folio}`;

            const btnX = document.createElement('button');
            btnX.className = 'remove-folio';
            btnX.innerHTML = '×';
            btnX.addEventListener('click', () => card.remove());

            card.append(h4, btnX);
            cardsContainer.appendChild(card);
        });

        inpEmail.value = '';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Capturamos el 2º click en fase capture
    toggleBtn.addEventListener('click', function(e) {
        if (this.dataset.selectionActive === 'true') {
            const marked = document.querySelectorAll('.check-folio:checked');
            if (marked.length === 0) {
                Swal.fire('Atención','Marca al menos un caso.','warning');
            } else {
                if (!injected) injectModal();
                openModal();
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);
});
