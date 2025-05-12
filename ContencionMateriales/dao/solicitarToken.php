<?php
session_start();
include_once("conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');

try {
    // 1. Validar método y campos
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido.');
    }

    if (empty($_POST['Username']) || empty($_POST['Email'])) {
        throw new Exception('Se requiere el nombre de usuario y un correo válido.');
    }

    $username     = trim($_POST['Username']);
    $emailDestino = trim($_POST['Email']);

    if (!filter_var($emailDestino, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El correo proporcionado no es válido.');
    }

    // 2. Conectar y buscar usuario
    $con = (new LocalConector())->conectar();

    $stmt = $con->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (!$stmt) throw new Exception('Error al preparar SELECT: ' . $con->error);

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario);

    if (!$stmt->fetch()) {
        throw new Exception("El usuario \"$username\" no existe.");
    }
    $stmt->close();

    // 3. Generar e insertar token
    $token  = bin2hex(random_bytes(16));
    $expira = date('Y-m-d H:i:s', time() + 3600); // válido por 1 hora

    $ins = $con->prepare("INSERT INTO RecuperarContrasena (IdUsuario, Token, Expira, TokenValido) VALUES (?, ?, ?, 1)");
    if (!$ins) throw new Exception('Error al preparar INSERT: ' . $con->error);

    $ins->bind_param("iss", $idUsuario, $token, $expira);
    if (!$ins->execute()) throw new Exception('Error al ejecutar INSERT: ' . $ins->error);
    $ins->close();

    // 4. Enviar correo usando endpoint en Hostinger
    $asunto = "Recuperación de contraseña";
    $mensaje = "
        <p>Hola <strong>$username</strong>,</p>
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Tu token es: <strong>$token</strong></p>
        <p>Este token expira en 1 hora. No lo compartas con nadie.</p>
    ";

    $postData = http_build_query([
        'correo'  => $emailDestino,
        'asunto'  => $asunto,
        'mensaje' => $mensaje
    ]);

    $ch = curl_init('https://grammermx.com/Mailer/enviarCorreoRecuperacion.php');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $result = curl_exec($ch);

    if ($result === false) {
        throw new Exception('Error cURL: ' . curl_error($ch));
    }

    curl_close($ch);
    $response = json_decode($result, true);

    if (!isset($response['status']) || $response['status'] !== 'success') {
        throw new Exception('Mailer error: ' . ($response['message'] ?? 'Sin respuesta válida.'));
    }

    // 5. OK
    echo json_encode([
        'status'  => 'success',
        'message' => 'Se ha enviado un token al correo ingresado.'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => '¡Fallo en solicitarToken.php! ' . $e->getMessage()
    ]);
}
