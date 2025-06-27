<?php
// mailer/enviarCorreoAsignacion.php

session_start();
include_once("conexionContencion.php");

// Incluir PHPMailer
require 'Phpmailer/Exception.php';
require 'Phpmailer/PHPMailer.php';
require 'Phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=UTF-8');

// Validación de parámetros obligatorios
if (!isset($_POST['correo'], $_POST['asunto'], $_POST['tabla'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros obligatorios.']);
    exit;
}

$correoDestino = $_POST['correo'];
$asunto       = $_POST['asunto'];
$tablaHTML    = $_POST['tabla'];

// Reemplazar “fol.” por “caso” en la tabla
$tablaHTML = str_replace('fol.', 'caso', $tablaHTML);

$mail = new PHPMailer(true);

try {
    // Configuración SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contencion_materiales@grammermx.com';
    $mail->Password   = 'Materiales12345;';
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    // Remitente y destinatarios
    $mail->setFrom('contencion_materiales@grammermx.com', 'Sistema Contención Materiales Grammer');
    $mail->addAddress($correoDestino);
    $mail->addBCC('contencion_materiales@grammermx.com');
    $mail->addBCC('Ivan.Medina@grammer.com');

    // Configuración del contenido
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $asunto;

    // HTML del correo
    $contenido = "
    <html>
    <head>
      <meta charset='UTF-8'>
      <title>$asunto</title>
    </head>
    <body style='font-family: Arial, sans-serif; background: #f4f4f4; padding: 0; margin: 0;'>
        <table style='max-width: 700px; margin: auto; background: white; border-radius: 10px; overflow: hidden;'>
            <tr>
                <td style='background-color: #1e2a38; color: white; padding: 20px; text-align: center;'>
                    <h2>$asunto</h2>
                </td>
            </tr>
            <tr>
                <td style='padding: 20px; color: #333333;'>
                    <p>Hola, se te han asignado los siguientes reportes:</p>
                    $tablaHTML
                    <p>Por favor revísalos cuanto antes.</p>
                </td>
            </tr>
            <tr>
                <td style='background-color: #202c3a; color: white; padding: 10px; text-align: center;'>
                    <p>© Grammer – Contención de Materiales</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    ";

    $mail->Body = $contenido;

    // Enviar correo
    $mail->send();

    echo json_encode(['status' => 'success', 'message' => 'Correo enviado correctamente.']);
} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al enviar correo: ' . $mail->ErrorInfo
    ]);
}
