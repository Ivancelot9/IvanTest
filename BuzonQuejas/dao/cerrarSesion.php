<?php
/* --- PHP: cerrarSesion.php ---
 *
 * @file cerrarSesion.php
 * @description
 * Gestiona el cierre de sesión para una pestaña específica de usuario.
 * Elimina el registro de `tab_id` de la sesión y, si no quedan pestañas
 * activas, destruye la sesión completa.
 *
 * Flujo:
 *  1. Iniciar la sesión PHP con session_start().
 *  2. Leer el parámetro GET `tab_id`.
 *  3. Si existe en $_SESSION['usuariosPorPestana'], removerlo.
 *  4. Si tras esto ya no hay pestañas en usuariosPorPestana:
 *     - Limpiar todas las variables de sesión.
 *     - Destruir la sesión.
 *  5. Enviar HTTP 200 OK y terminar la ejecución.
 *
 * Requiere:
 *  - `session_start()` para gestionar la sesión.
 *  - Array `$_SESSION['usuariosPorPestana']` donde se almacenan las pestañas activas.
 */

session_start();

/* ─────────────────────────────────────────
   1. Procesar tab_id recibido por GET
───────────────────────────────────────── */
if (isset($_GET['tab_id'])) {
    $tab_id = $_GET['tab_id'];

    // Si la pestaña está registrada, eliminarla
    if (isset($_SESSION['usuariosPorPestana'][$tab_id])) {
        unset($_SESSION['usuariosPorPestana'][$tab_id]);
    }
}

/* ─────────────────────────────────────────
   2. Si ya no hay pestañas activas, destruir sesión
───────────────────────────────────────── */
if (empty($_SESSION['usuariosPorPestana'])) {
    // Quitar todas las variables de sesión
    session_unset();
    // Destruir la sesión por completo
    session_destroy();
}

/* ─────────────────────────────────────────
   3. Responder con código HTTP 200 OK
───────────────────────────────────────── */
http_response_code(200);
exit;
