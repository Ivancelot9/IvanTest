<?php
// mailer/solicitarToken.php

// 1) Mostrar errores para que no sea un 500 “genérico”
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');

// 2) Incluye tu conector usando rutas absolutas
require __DIR__ . '/../dao/conexionContencion.php';

try {
    // 3) Verifica método y parámetro
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido, debe ser POST.');
    }
    if (empty($_POST['Username'])) {
        throw new Exception('Falta Username.');
    }
    $username = trim($_POST['Username']);

    // 4) Conexión y búsqueda de usuario
    $con = (new LocalConector())->conectar();
    $stmt = $con->prepare("SELECT IdUsuario, Correo FROM Usuario WHERE Username = ?");
    if (!$stmt) {
        throw new Exception('Error al preparar SELECT: ' . $con->error);
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario, $correo);
    if (!$stmt->fetch()) {
        throw new Exception('Usuario “' . $username . '” no existe.');
    }
    $stmt->close();

    if (empty($correo)) {
        throw new Exception('El usuario no tiene correo asociado.');
    }

    // 5) Genera e inserta token
    $token  = bin2hex(random_bytes(16));
    $expira = date('Y-m-d H:i:s', time() + 3600);
    $ins = $con->prepare(
        "INSERT INTO RecuperarContrasena (IdUsuario, Token, Expira, TokenValido)
         VALUES (?, ?, ?, 1)"
    );
    if (!$ins) {
        throw new Exception('Error al preparar INSERT: ' . $con->error);
    }
    $ins->bind_param("iss", $idUsuario, $token, $expira);
    if (!$ins->execute()) {
        throw new Exception('Error al ejecutar INSERT: ' . $ins->error);
    }
    $ins->close();

    // 6) Llama al endpoint de envío de correo usando cURL
    $postData = http_build_query([
        'correo'  => $correo,
        'asunto'  => 'Recuperación de contraseña',
        'mensaje' => "<p>Hola <strong>$username</strong>, tu token es: <strong>$token</strong> (expira en 1 h).</p>"
    ]);
    $ch = curl_init('https://grammermx.com/IvanTest/ContencionMateriales/mailer/enviarCorreoRecuperacion.php');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 20,
    ]);
    $result = curl_exec($ch);
    if ($err = curl_error($ch)) {
        throw new Exception('cURL: ' . $err);
    }
    curl_close($ch);
    $resp = json_decode($result, true);
    if (!isset($resp['status'])) {
        throw new Exception('Respuesta inválida del mailer: ' . $result);
    }
    if ($resp['status'] !== 'success') {
        throw new Exception('Mailer error: ' . $resp['message']);
    }

    // 7) Todo OK
    echo json_encode([
        'status'  => 'success',
        'message' => 'Token enviado al correo.'
    ]);

} catch (Exception $e) {
    // Devuelve detalle de la excepción
    echo json_encode([
        'status'  => 'error',
        'message' => '¡Fallo en solicitarToken.php! ' . $e->getMessage()
    ]);
}
