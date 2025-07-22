<?php
/**
 * @file enviarCorreoAsignacion.php
 * @project Contención de Materiales
 * @module Mailer
 * @purpose Enviar correos HTML con tabla de casos asignados al correo de destino
 * @description Este script recibe una tabla HTML por POST junto con el correo y asunto,
 *              procesa el contenido para asegurar estilo uniforme, y envía un correo
 *              mediante PHPMailer usando configuración SMTP con cuenta empresarial.
 * @dependencies
 *    - PHPMailer (PHPMailer/PHPMailer.php, PHPMailer/Exception.php, PHPMailer/SMTP.php)
 *    - conexiónContención.php (conexión activa a la base de datos)
 * @author Ivan Medina / Hadbet Altamirano
 * @created Julio 2025
 * @updated [¿?]
 */

session_start();
include_once("conexionContencion.php"); // Conexión a la base de datos (no se usa directamente aquí, pero se requiere por políticas del sistema)

// Incluir librerías de PHPMailer
require 'Phpmailer/Exception.php';
require 'Phpmailer/PHPMailer.php';
require 'Phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Asegura formato JSON en la respuesta
header('Content-Type: application/json; charset=UTF-8');

// Validación de parámetros requeridos
if (!isset($_POST['correo'], $_POST['asunto'], $_POST['tabla'])) {
    echo json_encode(['status'=>'error','message'=>'Faltan parámetros obligatorios.']);
    exit;
}

$correoDestino = $_POST['correo'];
$asunto        = $_POST['asunto'];
$tablaHTML     = $_POST['tabla'];

// === LIMPIEZA Y ESTILIZACIÓN DEL CONTENIDO HTML ===

// 1) Reemplazar cualquier referencia a "folio" o "fol." por "Caso"
$tablaHTML = str_ireplace(['folio','fol.'], 'Caso', $tablaHTML);

// 2) Aplicar estilos inline a tabla, encabezados y celdas para asegurar compatibilidad visual en correos
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

// === CONFIGURACIÓN Y ENVÍO DEL CORREO ===

$mail = new PHPMailer(true);

try {
    // Configuración SMTP (servidor de correo)
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contencion_materiales@grammermx.com';
    $mail->Password   = 'Materiales12345;';
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    // Direcciones de envío
    $mail->setFrom('contencion_materiales@grammermx.com','Sistema Contención Materiales Grammer');
    $mail->addAddress($correoDestino); // Principal
    $mail->addBCC('contencion_materiales@grammermx.com'); // Copia oculta a sistema
    $mail->addBCC('Ivan.Medina@grammer.com'); // Copia para seguimiento

    // Contenido del mensaje
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $asunto;

    // Cuerpo HTML del correo
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

    // Envío del correo
    $mail->send();
    echo json_encode(['status'=>'success','message'=>'Correo enviado correctamente.']);

} catch (Exception $e) {
    // Manejo de errores
    echo json_encode(['status'=>'error','message'=>'Error al enviar correo: '.$mail->ErrorInfo]);
}
?>