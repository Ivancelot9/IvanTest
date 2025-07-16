<?php
/**
===============================================================================
@file       enviarCorreoRecuperacion.php
@project    Programa de Contención de Materiales
@module     Envío de Correos (Recuperación)
@purpose    Enviar un correo HTML con un token de recuperación al usuario.
@description
Este script recibe datos por POST (correo, asunto, mensaje HTML), configura
PHPMailer para enviar un correo a través del servidor SMTP de Hostinger, y
entrega un correo con estilo profesional al destinatario. Se utiliza en el
flujo de recuperación de contraseña, como parte del endpoint llamado desde
`solicitarToken.php`.

➤ Requiere: PHPMailer (en carpeta Phpmailer/)
➤ SMTP: smtp.hostinger.com con cuenta contencion_materiales@grammermx.com
➤ Se recomienda proteger las credenciales en producción (no hardcodearlas)

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

session_start();
include_once("conexionContencion.php");

// Incluir PHPMailer
require 'Phpmailer/Exception.php';
require 'Phpmailer/PHPMailer.php';
require 'Phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=UTF-8');

// ─────────────────────────────────────────
// Validar que se reciban los parámetros necesarios
// ─────────────────────────────────────────
if (!isset($_POST['correo'], $_POST['asunto'], $_POST['mensaje'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros obligatorios.']);
    exit;
}

// ─────────────────────────────────────────
// Variables recibidas desde POST
// ─────────────────────────────────────────
$correoDestino = $_POST['correo'];
$asunto        = $_POST['asunto'];
$mensajeHTML   = $_POST['mensaje'];

$mail = new PHPMailer(true);

try {
    // ─────────────────────────────────────────
    // Configuración del servidor SMTP
    // ─────────────────────────────────────────
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contencion_materiales@grammermx.com';
    $mail->Password   = 'Materiales12345;'; // ⚠️ Para producción, ocultar este dato sensible
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    // ─────────────────────────────────────────
    // Remitente y destinatarios
    // ─────────────────────────────────────────
    $mail->setFrom('contencion_materiales@grammermx.com', 'Sistema Contención Materiales Grammer');
    $mail->addAddress($correoDestino); // Usuario objetivo
    $mail->addBCC('contencion_materiales@grammermx.com'); // Copia oculta
    $mail->addBCC('Ivan.Medina@grammer.com'); // Opcional: copia interna

    // ─────────────────────────────────────────
    // Contenido del correo (HTML)
    // ─────────────────────────────────────────
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $asunto;

    $contenido = "
    <html>
    <head><meta charset='UTF-8'><title>$asunto</title></head>
    <body style='font-family: Arial, sans-serif; background: #f4f4f4; padding: 0; margin: 0;'>
        <table style='max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden;'>
            <tr>
                <td style='background-color: #0366d6; color: white; padding: 20px; text-align: center;'>
                    <h2>$asunto</h2>
                </td>
            </tr>
            <tr>
                <td style='padding: 20px; color: #333333;'>$mensajeHTML</td>
            </tr>
            <tr>
                <td style='background-color: #0366d6; color: white; padding: 10px; text-align: center;'>
                    <p>© Grammer – Contención de Materiales</p>
                </td>
            </tr>
        </table>
    </body>
    </html>";

    $mail->Body = $contenido;

    // ─────────────────────────────────────────
    // Intentar enviar correo
    // ─────────────────────────────────────────
    $mail->send();

    echo json_encode(['status' => 'success', 'message' => 'Correo enviado correctamente.']);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al enviar correo: ' . $mail->ErrorInfo
    ]);
}
