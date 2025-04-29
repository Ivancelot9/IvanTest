<?php
/* --- PHP: cerrarSesionUsuario.php ---
 *
 * @file cerrarSesionUsuario.php
 * @description
 * Cierra la sesión completa de un usuario al finalizar su uso:
 *  1. Inicia o reanuda la sesión con session_start().
 *  2. Elimina todas las variables de sesión con session_unset().
 *  3. Destruye la sesión por completo con session_destroy().
 *  4. Devuelve un HTTP 200 OK para indicar éxito.
 *
 * Requiere:
 *  - Extensión de sesiones de PHP habilitada.
 */

session_start();             // 1. Iniciar o reanudar la sesión actual
session_unset();             // 2. Eliminar todas las variables de sesión
session_destroy();           // 3. Destruir la sesión por completo

http_response_code(200);     // 4. Enviar respuesta 200 OK
exit;
