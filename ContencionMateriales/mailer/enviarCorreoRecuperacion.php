<?php
// mailer/enviarCorreoaExterno.php

session_start();
include_once("../dao/conexionContencion.php");

// Incluir PHPMailer
require '../Phpmailer/Exception.php';
require '../Phpmailer/PHPMailer.php';
require '../Phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_POST['correo'], $_POST['folios']) || !is_array($_POST['folios'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros o el formato es incorrecto.']);
    exit;
}

$correoDestino = $_POST['correo'];
$folios        = $_POST['folios'];
$asunto        = "Casos asignados para revisión";

$mail = new PHPMailer(true);

try {
    // Configuración del servidor SMTP
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

    // Cuerpo del mensaje
    $listaFolios = '';
    foreach ($folios as $folio) {
        $listaFolios .= "• Caso $folio<br>";
    }

    $mensajeHTML = "
    <p>Se te han asignado los siguientes casos:</p>
    <p>$listaFolios</p>
    <p>Puedes consultarlos en el siguiente enlace:<br>
    <a href='https://grammermx.com/IvanTest/ContencionMateriales/buscadorCasos.php' target='_blank'>
    https://grammermx.com/IvanTest/ContencionMateriales/buscadorCasos.php</a></p>";

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
    $mail->send();

    echo json_encode(['status' => 'success', 'message' => 'Correo enviado correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al enviar correo: ' . $mail->ErrorInfo]);
}
