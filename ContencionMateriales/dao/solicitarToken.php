<?php
/**
===============================================================================
@file       solicitarToken.php
@project    Programa de Contención de Materiales
@module     Recuperación de Contraseña
@purpose    Generar un token temporal para restablecer contraseña y enviarlo por correo.
@description
Este script procesa la solicitud de recuperación de contraseña desde el frontend.
Valida el usuario y correo recibido, genera un token numérico de 6 dígitos con
caducidad de 10 minutos, lo guarda en la base de datos y envía un correo al usuario
con el token. Utiliza un endpoint externo en Hostinger para el envío de correo.

➤ Se invoca desde JS en: inicioSesionContecion.js (flujo recuperación)
➤ Depende de la tabla `RecuperarContrasena` para almacenar los tokens
➤ Envia el correo vía: https://grammermx.com/Mailer/enviarCorreoRecuperacion.php(esta en hostinger
 * el archivo duplicado de manera local y en hostinger para que pueda servir)

⚠️ Si el correo falla, el token se guarda pero el usuario no es notificado.
Idealmente, se debe validar respuesta del mailer antes de insertar token.

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

session_start();
include_once("conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');

try {
    // ─────────────────────────────────────────
    // 1. Validar método HTTP y campos requeridos
    // ─────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido.');
    }

    if (empty($_POST['Username']) || empty($_POST['Email'])) {
        throw new Exception('Se requiere el nombre de usuario y un correo válido.');
    }

    $username     = trim($_POST['Username']);
    $emailDestino = trim($_POST['Email']);

    // Validación básica de formato de correo
    if (!filter_var($emailDestino, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El correo proporcionado no es válido.');
    }

    // ─────────────────────────────────────────
    // 2. Buscar al usuario en la base de datos
    // ─────────────────────────────────────────
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

    // ─────────────────────────────────────────
    // 3. Generar e insertar token de recuperación
    // ─────────────────────────────────────────
    $token  = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT); // token numérico
    $expira = date('Y-m-d H:i:s', time() + 600); // válido por 10 minutos

    $ins = $con->prepare("INSERT INTO RecuperarContrasena (IdUsuario, Token, Expira, TokenValido) VALUES (?, ?, ?, 1)");
    if (!$ins) throw new Exception('Error al preparar INSERT: ' . $con->error);

    $ins->bind_param("iss", $idUsuario, $token, $expira);
    if (!$ins->execute()) throw new Exception('Error al ejecutar INSERT: ' . $ins->error);
    $ins->close();

    // ─────────────────────────────────────────
    // 4. Enviar correo con el token
    // ─────────────────────────────────────────
    $asunto = "Recuperación de contraseña";
    $mensaje = "
        <p>Hola <strong>$username</strong>,</p>
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Tu token es: <strong>$token</strong></p>
        <p>Este token expira en 10 minutos. No lo compartas con nadie. Ingrésalo en la página.</p>
    ";

    // Preparar datos para el endpoint externo
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
        CURLOPT_TIMEOUT        => 20,
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

    // ─────────────────────────────────────────
    // 5. Éxito
    // ─────────────────────────────────────────
    echo json_encode([
        'status'  => 'success',
        'message' => 'Se ha enviado un token al correo ingresado.'
    ]);

} catch (Exception $e) {
    // Error capturado en cualquier parte del flujo
    echo json_encode([
        'status'  => 'error',
        'message' => '¡Fallo en solicitarToken.php! ' . $e->getMessage()
    ]);
}
