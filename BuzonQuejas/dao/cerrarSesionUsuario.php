<?php
session_start();
session_unset(); // Elimina variables de sesión
session_destroy(); // Destruye sesión completamente

http_response_code(200); // Todo bien
exit;