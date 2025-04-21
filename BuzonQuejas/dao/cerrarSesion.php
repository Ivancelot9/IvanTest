<?php
session_start();

if (isset($_GET['tab_id'])) {
    $tab_id = $_GET['tab_id'];

    if (isset($_SESSION['usuariosPorPestana'][$tab_id])) {
        unset($_SESSION['usuariosPorPestana'][$tab_id]);
    }
}

// Si ya no hay más pestañas activas, destruir toda la sesión
if (empty($_SESSION['usuariosPorPestana'])) {
    session_unset();
    session_destroy();
}

http_response_code(200);
exit;
