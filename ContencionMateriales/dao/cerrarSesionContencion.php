<?php

// dao/cerrarSesionContencion.php

/**
 * Cierre de sesión para el sistema de Contención de Materiales.
 * - Elimina el tab_id actual de la sesión.
 * - Si no hay más pestañas activas, destruye toda la sesión.
 */

session_start();

// 1. Verifica si se proporcionó el tab_id por GET
if (isset($_GET['tab_id'])) {
    $tab_id = $_GET['tab_id'];

    // 2. Si esa pestaña existe en la sesión, elimínala
    if (isset($_SESSION['usuariosPorPestana'][$tab_id])) {
        unset($_SESSION['usuariosPorPestana'][$tab_id]);
    }
}

// 3. Si ya no hay pestañas activas, destruye la sesión por completo
if (empty($_SESSION['usuariosPorPestana'])) {
    session_unset();
    session_destroy();
}

// 4. Devuelve HTTP 200 OK
http_response_code(200);
exit;

