// modalEnviarCorreos.js
// Requiere SweetAlert2 (Swal.fire)

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

        btnSend.addEventListener('click', async () => {
            const folios = Array.from(cardsContainer.children)
                .map(card => card.dataset.folio);
            const email = inpEmail.value.trim();

            if (!/.+@.+\..+/.test(email)) {
                Swal.fire('Error', 'Ingresa un correo válido.', 'error');
                return;
            }

            // Construir la tabla con enlaces a verCaso.php
            const tablaHTML = `
                <table border="1" cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse;">
                    <thead style="background:#0366d6;color:white;">
                        <tr><th>Folio</th><th>Ver</th></tr>
                    </thead>
                    <tbody>
                        ${folios.map(folio => `
                            <tr>
                                <td style="text-align:center;">${folio}</td>
                                <td style="text-align:center;">
                                    <a href="https://grammermx.com/IvanTest/ContencionMateriales/dao/verCaso.php?folio=${folio}"
                                       target="_blank">
                                        Ver caso
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            const asunto = `Casos asignados - Contención de Materiales`;

            try {
                const formData = new FormData();
                formData.append('correo', email);
                formData.append('asunto', asunto);
                formData.append('tabla', tablaHTML);

                const resp = await fetch('https://grammermx.com/Mailer/enviarCorreoaExterno.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await resp.json();

                if (data.status === 'success') {
                    Swal.fire('Éxito', 'Correo enviado correctamente.', 'success');
                    closeModal();
                } else {
                    throw new Error(data.message || 'Fallo al enviar correo');
                }
            } catch (err) {
                Swal.fire('Error', 'Falló el envío: ' + err.message, 'error');
            }
        });

        injected = true;
    }

    function openModal() {
        cardsContainer.innerHTML = '';
        const folios = Array.from(document.querySelectorAll('.check-folio:checked'))
            .map(cb => cb.value);

        folios.forEach(folio => {
            const card = document.createElement('div');
            card.className = 'folio-card';
            card.dataset.folio = folio;
            card.innerHTML = `
                <h4>Caso ${folio}</h4>
                <button class="remove-folio">×</button>
            `;
            card.querySelector('.remove-folio')
                .addEventListener('click', () => card.remove());
            cardsContainer.appendChild(card);
        });

        inpEmail.value = '';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        if (toggleBtn.dataset.selectionActive === 'true') {
            toggleBtn.dataset.selectionActive = 'false';
            toggleBtn.click();
        }
    }

    toggleBtn.addEventListener('click', function (e) {
        if (this.dataset.selectionActive === 'true') {
            const marked = document.querySelectorAll('.check-folio:checked');
            if (marked.length === 0) {
                Swal.fire('Atención', 'Marca al menos un caso.', 'warning');
            } else {
                if (!injected) injectModal();
                openModal();
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);
});
