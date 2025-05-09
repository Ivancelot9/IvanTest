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

$username        = trim($_POST['Username'] ?? '');
$receivedToken   = trim($_POST['Token'] ?? '');
$nuevaContrasena = trim($_POST['NuevaContrasena'] ?? '');

if ($username === '' || $receivedToken === '' || strlen($nuevaContrasena) < 6) {
    echo json_encode(['status'=>'error','message'=>'Datos incompletos o contraseña muy corta.']);
    exit;
}

try {
    $con = (new LocalConector())->conectar();

    // 1) Obtener IdUsuario
    $stmt = $con->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario);
    if (!$stmt->fetch()) {
        echo json_encode(['status'=>'error','message'=>'Usuario no encontrado.']);
        exit;
    }
    $stmt->close();

    // 2) Verificar token válido y no expirado
    $chk = $con->prepare("
        SELECT IdRecuperarContra
          FROM RecuperarContrasena
         WHERE IdUsuario = ?
           AND Token = ?
           AND TokenValido = 1
           AND Expira > NOW()
    ");
    $chk->bind_param("is", $idUsuario, $receivedToken);
    $chk->execute();
    $chk->bind_result($idRec);
    if (!$chk->fetch()) {
        echo json_encode(['status'=>'error','message'=>'Token inválido o expirado.']);
        exit;
    }
    $chk->close();

    // 3) Actualizar contraseña en Usuario
    $updUser = $con->prepare("
        UPDATE Usuario
           SET Contrasena = ?
         WHERE IdUsuario = ?
    ");
    $updUser->bind_param("si", $nuevaContrasena, $idUsuario);
    $updUser->execute();
    $updUser->close();

    // 4) Invalidar ese token
    $updTok = $con->prepare("
        UPDATE RecuperarContrasena
           SET TokenValido = 0
         WHERE IdRecuperarContra = ?
    ");
    $updTok->bind_param("i", $idRec);
    $updTok->execute();
    $updTok->close();

    echo json_encode(['status'=>'success','message'=>'Contraseña restablecida exitosamente.']);
} catch (Exception $e) {
    error_log("cambiarContrasena error: " . $e->getMessage());
    echo json_encode(['status'=>'error','message'=>'Error del servidor.']);
}


