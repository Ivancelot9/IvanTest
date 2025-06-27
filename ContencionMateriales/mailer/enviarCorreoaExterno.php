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

// Validar parámetros
if (!isset($_POST['correo'], $_POST['asunto'], $_POST['tabla'])) {
    echo json_encode(['status'=>'error','message'=>'Faltan parámetros obligatorios.']);
    exit;
}

$correoDestino = $_POST['correo'];
$asunto        = $_POST['asunto'];
$tablaHTML     = $_POST['tabla'];

// 1) Reemplazar TODO “folio” o “fol.” por “Caso” (sensible a mayúsculas)
$tablaHTML = str_ireplace(['folio','fol.'], 'Caso', $tablaHTML);

// 2) Añadir inline styles para forzar tus colores
$tablaHTML = preg_replace(
    '/<table([^>]*)>/i',
    '<table$1 style="width:100%; border-collapse:collapse; background:white; border:1px solid #ddd;">',
    $tablaHTML
);
$tablaHTML = preg_replace(
    '/<th([^>]*)>/i',
    '<th$1 style="background-color:#1e2a38; color:white; padding:8px; border:1px solid #ddd;">',
    $tablaHTML
);
$tablaHTML = preg_replace(
    '/<td([^>]*)>/i',
    '<td$1 style="padding:8px; color:#333333; border:1px solid #ddd;">',
    $tablaHTML
);

$mail = new PHPMailer(true);

try {
    // SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contencion_materiales@grammermx.com';
    $mail->Password   = 'Materiales12345;';
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    // Destinos
    $mail->setFrom('contencion_materiales@grammermx.com','Sistema Contención Materiales Grammer');
    $mail->addAddress($correoDestino);
    $mail->addBCC('contencion_materiales@grammermx.com');
    $mail->addBCC('Ivan.Medina@grammer.com');

    // Contenido
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $asunto;

    $mail->Body = "
    <html>
      <head><meta charset='UTF-8'><title>$asunto</title></head>
      <body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;'>
        <table style='max-width:700px;margin:20px auto;background:white;border-radius:10px;overflow:hidden;'>
          <tr>
            <td style='background:#1e2a38;color:#fff;padding:20px;text-align:center;'>
              <h2>$asunto</h2>
            </td>
          </tr>
          <tr>
            <td style='padding:20px;color:#333;'>
              <p>Hola, se te han asignado los siguientes reportes:</p>
              $tablaHTML
              <p>Por favor revísalos cuanto antes.</p>
            </td>
          </tr>
          <tr>
            <td style='background:#202c3a;color:#fff;padding:10px;text-align:center;'>
              <p>© Grammer – Contención de Materiales</p>
            </td>
          </tr>
        </table>
      </body>
    </html>";

    $mail->send();
    echo json_encode(['status'=>'success','message'=>'Correo enviado correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status'=>'error','message'=>'Error al enviar correo: '.$mail->ErrorInfo]);
}
