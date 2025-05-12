<?php
session_start();
include_once("../dao/conexionContencion.php");

// Encabezado JSON
header('Content-Type: application/json; charset=UTF-8');

// Validar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (empty($_POST['Username'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario requerido.']);
    exit;
}

$username = trim($_POST['Username']);

try {
    $con = (new LocalConector())->conectar();

    // Buscar correo y ID del usuario
    $stmt = $con->prepare("SELECT IdUsuario, Correo FROM Usuario WHERE Username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario, $correo);

    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
        exit;
    }
    $stmt->close();

    // Generar token
    $token = bin2hex(random_bytes(16));
    $expira = date('Y-m-d H:i:s', time() + 3600);

    // Insertar en tabla de recuperación
    $ins = $con->prepare("INSERT INTO RecuperarContrasena (IdUsuario, Token, Expira, TokenValido) VALUES (?, ?, ?, 1)");
    $ins->bind_param("iss", $idUsuario, $token, $expira);
    $ins->execute();
    $ins->close();

    // Preparar datos para correo
    $asunto  = "Recuperación de Contraseña";
    $mensaje = "<p>Has solicitado restablecer tu contraseña.</p>
                <p>Tu token es: <strong>$token</strong></p>
                <p>Este token expira en 1 hora. No lo compartas con nadie.</p>";

    // Enviar correo
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
    $result  = file_get_contents('https://grammermx.com/IvanTest/ContencionMateriales/dao/enviarCorreoRecuperacion.php', false, $context);
    $response = json_decode($result, true);

    if ($response['status'] === 'success') {
        echo json_encode(['status' => 'success', 'message' => 'Token enviado al correo.', 'debugToken' => $token]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al enviar correo: ' . $response['message']]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor.']);
}