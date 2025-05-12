<?php
session_start();
include_once("../dao/conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (empty($_POST['Username'])) {
    echo json_encode(['status' => 'error', 'message' => 'Se requiere el nombre de usuario.']);
    exit;
}

$username = trim($_POST['Username']);

try {
    $con = (new LocalConector())->conectar();

    // Buscar usuario y correo
    $stmt = $con->prepare("SELECT IdUsuario, Correo FROM Usuario WHERE Username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario, $correo);

    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'El usuario no existe.']);
        exit;
    }
    $stmt->close();

    if (empty($correo)) {
        echo json_encode(['status' => 'error', 'message' => 'Este usuario no tiene correo asociado.']);
        exit;
    }

    // Generar token de recuperación
    $token  = bin2hex(random_bytes(16));
    $expira = date('Y-m-d H:i:s', time() + 3600); // 1 hora de validez

    $ins = $con->prepare("INSERT INTO RecuperarContrasena (IdUsuario, Token, Expira, TokenValido) VALUES (?, ?, ?, 1)");
    $ins->bind_param("iss", $idUsuario, $token, $expira);
    $ins->execute();
    $ins->close();

    // Enviar correo usando endpoint de correo
    $asunto = "Recuperación de contraseña";
    $mensaje = "
        <p>Hola <strong>$username</strong>,</p>
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Tu token es: <strong>$token</strong></p>
        <p>Este token expira en 1 hora. No lo compartas con nadie.</p>";

    $formData = http_build_query([
        'correo'  => $correo,
        'asunto'  => $asunto,
        'mensaje' => $mensaje
    ]);

    $opts = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-type: application/x-www-form-urlencoded",
            'content' => $formData
        ]
    ];

    $context = stream_context_create($opts);
    $result  = file_get_contents('https://grammermx.com/IvanTest/ContencionMateriales/mailer/enviarCorreoRecuperacion.php', false, $context);
    $response = json_decode($result, true);

    if ($response['status'] === 'success') {
        echo json_encode([
            'status'  => 'success',
            'message' => 'Se ha enviado un token al correo registrado.'
        ]);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Error al enviar el correo: ' . $response['message']
        ]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor.']);
}
