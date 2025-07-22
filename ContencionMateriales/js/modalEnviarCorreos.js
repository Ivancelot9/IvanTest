/**
 * @file modalEnviarCorreos.js
 * @project Contención de Materiales
 * @module modalEnviarCorreos
 * @purpose Mostrar un modal para seleccionar casos marcados y enviarlos por correo
 * @description
 * Este script genera un modal HTML cuando el usuario hace clic en el botón con ID `btn-toggle-seleccion`.
 * Permite:
 * - Visualizar una lista de casos seleccionados mediante checkboxes
 * - Ingresar una dirección de correo
 * - Enviar por POST una tabla con los enlaces a los casos seleccionados
 *
 * Utiliza SweetAlert2 para validaciones y mensajes de estado.
 *
 * @uso
 * - Requiere que existan checkboxes con clase `.check-folio` por cada caso (inyectados por seleccionadorCasos.js)
 * - Requiere el botón `#btn-toggle-seleccion` visible en el DOM
 *
 * @dependencias
 * - ✅ SweetAlert2 (`Swal.fire`)
 * - ✅ Archivo dependiente: `seleccionadorCasos.js` (inyecta checkboxes `.check-folio`)
 * - 🌐 Endpoint remoto: `https://grammermx.com/Mailer/enviarCorreoaExterno.php` (envío de correo)
 * - 🌐 Enlaces generados hacia: `dao/verCaso.php?folio=...` (para ver casos externos)
 *
 * @autor Ivan Medina/Hadbet Altamirano
 * @created Junio 2025
 * @updated [¿?]
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-seleccion');
    if (!toggleBtn) return;

    let injected = false; // Marca si el modal ya fue inyectado
    let modal, backdrop, btnClose, btnCancel, btnSend, cardsContainer, inpEmail;

    /**
     * Inyecta el HTML del modal solo una vez en el <body>
     */
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

        // Asignar referencias a los elementos internos del modal
        modal          = document.getElementById('modal-enviar');
        backdrop       = modal.querySelector('.backdrop');
        btnClose       = document.getElementById('modal-close');
        btnCancel      = document.getElementById('modal-cancel');
        btnSend        = document.getElementById('modal-send');
        cardsContainer = document.getElementById('cards-container');
        inpEmail       = document.getElementById('email-destino');

        // Cierre del modal con botones o fondo
        backdrop.addEventListener('click', closeModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        /**
         * Lógica de envío del correo con los casos seleccionados
         */
        btnSend.addEventListener('click', async () => {
            const folios = Array.from(cardsContainer.children).map(card => card.dataset.folio);
            const email = inpEmail.value.trim();

            // Validación simple de correo
            if (!/.+@.+\..+/.test(email)) {
                Swal.fire('Error', 'Ingresa un correo válido.', 'error');
                return;
            }

            // Construcción del cuerpo del correo con tabla de enlaces
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
                                       target="_blank">Ver caso</a>
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

    /**
     * Muestra el modal y carga los casos seleccionados como "tarjetas"
     */
    function openModal() {
        cardsContainer.innerHTML = '';
        const folios = Array.from(document.querySelectorAll('.check-folio:checked')).map(cb => cb.value);

        folios.forEach(folio => {
            const card = document.createElement('div');
            card.className = 'folio-card';
            card.dataset.folio = folio;
            card.innerHTML = `
                <h4>Caso ${folio}</h4>
                <button class="remove-folio">×</button>
            `;
            card.querySelector('.remove-folio').addEventListener('click', () => card.remove());
            cardsContainer.appendChild(card);
        });

        inpEmail.value = '';
        modal.style.display = 'block';
    }

    /**
     * Cierra el modal y desactiva la selección visual de checkboxes
     */
    function closeModal() {
        modal.style.display = 'none';
        if (toggleBtn.dataset.selectionActive === 'true') {
            toggleBtn.dataset.selectionActive = 'false';
            toggleBtn.click();
        }
    }

    /**
     * Controla el comportamiento del botón de selección y despliegue del modal
     */
    toggleBtn.addEventListener('click', function (e) {
        if (this.dataset.selectionActive === 'true') {
            const marked = document.querySelectorAll('.check-folio:checked');
            if (marked.length === 0) {
                Swal.fire('Atención', 'Marca al menos un caso.', 'warning');
            } else {
                if (!injected) injectModal();
                openModal();
            }
            e.stopImmediatePropagation(); // Evita ejecución doble
            e.preventDefault(); // Previene comportamiento default
        }
    }, true);
});