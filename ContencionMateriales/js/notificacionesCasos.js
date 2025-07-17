/**
 * @file notificacionesCasos.js
 * @project Contención de Materiales
 * @module notificaciones
 * @purpose Recibir notificaciones en tiempo real al generarse nuevos casos
 * @description Este script escucha el canal `canal-casos` mediante `BroadcastChannel`
 * para actualizar dinámicamente el contador de nuevos casos en el botón de historial,
 * así como insertar una nueva fila en la tabla #historial-casos si llega un nuevo caso.
 * El contador se almacena en `localStorage` y se reinicia al abrir la sección.
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated Junio 2025
 *
 * @uso
 * Este script se usa en `dashboardContencion.php`, y requiere que el botón con
 * id `btn-historial-casos` tenga un `span.badge-count` como contador visual.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 🧍 Obtener nombre de usuario para usar como clave de almacenamiento local
    const username     = document.body.dataset.username;

    // 📡 Canal de comunicación entre pestañas o ventanas
    const canalGlobal  = new BroadcastChannel('canal-casos');

    // 📌 Botón que activa la sección de historial global
    const btnHistorial = document.getElementById('btn-historial-casos');

    // 🔢 Contador visual (badge) de nuevos casos para admin
    let badgeAdmin = null;
    if (btnHistorial) {
        badgeAdmin = btnHistorial.querySelector('.badge-count');
    } else {
        console.warn('⚠️ No se encontró #btn-historial-casos en el DOM');
    }

    // 🗝️ Clave única por usuario para guardar el conteo en localStorage
    const storageKeyA  = `adminNewCases_${username}`;
    let contadorAdmin  = parseInt(localStorage.getItem(storageKeyA) || '0', 10);

    // 🟢 Mostrar valor inicial en el badge si existía
    actualizarBadgeAdmin(contadorAdmin);

    // 📥 Escuchar mensajes de nuevos casos desde otras pestañas
    canalGlobal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            // Incrementar y guardar en localStorage
            contadorAdmin++;
            localStorage.setItem(storageKeyA, contadorAdmin);
            actualizarBadgeAdmin(contadorAdmin);

            // 👀 Agregar fila al historial de casos
            const tbody = document.querySelector('#historial-casos .cases-table tbody');
            if (tbody && data.folio && data.fecha) {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${data.folio}</td>` +                                            // 0: Folio
                    `<td>${data.fecha}</td>` +                                            // 1: Fecha Registro
                    `<td>${data.responsable}</td>` +                                      // 2: Responsable
                    `<td>${data.terciaria}</td>` +                                        // 3: Terciaria
                    `<td><button class="show-desc" data-folio="${data.folio}">Mostrar descripción</button></td>` +
                    // 4: Descripción
                    `<td>${data.estatus}</td>`;                                           // 5: Estatus
                tbody.prepend(tr);
                // Registrar nueva fila en paginador si existe
                if (window.historialPaginador) window.historialPaginador.addRow(tr);
            }
        }
    });

    // 🔄 Reiniciar el contador al abrir la sección del historial global
    btnHistorial.addEventListener('click', () => {
        contadorAdmin = 0;
        localStorage.setItem(storageKeyA, '0');
        actualizarBadgeAdmin(0);
    });

    /**
     * Actualiza visualmente el contador en el botón de historial
     * @param {number} c - cantidad a mostrar
     */
    function actualizarBadgeAdmin(c) {
        if (c > 0) {
            badgeAdmin.textContent = c;
            badgeAdmin.style.display = 'inline-block';
        } else {
            badgeAdmin.style.display = 'none';
        }
    }
});
