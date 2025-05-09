<?php
/* dao/resetPasswordContencion.php
 *
 * Valida el token y actualiza la contraseña del usuario.
 * Recibe POST  ‘Username’, ‘Token’, ‘NuevaContrasena’.
 * Devuelve JSON { status, message }.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/conexionContencion.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status'=>'error','message'=>'Método no permitido.']);
    exit;
}

$post = $_POST;
if (empty($post['Username']) || empty($post['Token']) || empty($post['NuevaContrasena'])) {
    echo json_encode(['status'=>'error','message'=>'Datos incompletos.']);
    exit;
}

$username      = trim($post['Username']);
$token         = trim($post['Token']);
$nuevaPassword = trim($post['NuevaContrasena']);

try {
    $con = (new LocalConector())->conectar();

    // 1) Validar token válido
    $stmt = $con->prepare(
        "SELECT rc.IdUsuario
         FROM RecuperarContrasena rc
         JOIN Usuario u ON u.IdUsuario = rc.IdUsuario
        WHERE u.Username = ?
          AND rc.Token = ?
          AND rc.TokenValido = 1
          AND rc.Expira > NOW()"
    );
    $stmt->bind_param("ss", $username, $token);
    $stmt->execute();
    $stmt->bind_result($idUsuario);
    if (!$stmt->fetch()) {
        echo json_encode(['status'=>'error','message'=>'Token inválido o expirado.']);
        exit;
    }
    $stmt->close();

    // 2) Actualizar contraseña
    $upd = $con->prepare("UPDATE Usuario SET Contrasena = ? WHERE IdUsuario = ?");
    $upd->bind_param("si", $nuevaPassword, $idUsuario);
    $upd->execute();
    $upd->close();

    // 3) Invalidar token
    $inv = $con->prepare(
        "UPDATE RecuperarContrasena 
          SET TokenValido = 0 
        WHERE Token = ?"
    );
    $inv->bind_param("s", $token);
    $inv->execute();
    $inv->close();

    echo json_encode(['status'=>'success','message'=>'Contraseña restablecida con éxito.']);
} catch (Exception $e) {
    echo json_encode(['status'=>'error','message'=>'Error del servidor.']);
}

