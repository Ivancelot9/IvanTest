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
$tablaHTML    = $_POST['tabla']; // viene armado desde JS o PHP anterior

// 1) Reemplazar encabezado "fol." por "caso"
$tablaHTML = str_replace('fol.', 'caso', $tablaHTML);

$mail = new PHPMailer(true);

try {
    // Config SMTP
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

    // 2) Adjuntar imagen para incrustar en el HTML
    //    Asume que Recurso 6 (2).png está en el mismo directorio que este script
    $mail->addEmbeddedImage(__DIR__ . '/Recurso 6 (2).png', 'recurso6');

    // Config del contenido
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $asunto;

    // HTML personalizado con nuevos colores y la imagen al final
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
                    <img src='cid:recurso6' alt='Recurso' style='max-width: 120px; margin-top: 8px; display: block; margin-left: auto; margin-right: auto;'/>
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
