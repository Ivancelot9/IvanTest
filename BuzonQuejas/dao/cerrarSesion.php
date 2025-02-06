<?php
session_start();
session_unset(); // Elimina todas las variables de sesión
session_destroy(); // Destruye la sesión actual

http_response_code(200); // Indica que la petición fue exitosa
exit;
?>