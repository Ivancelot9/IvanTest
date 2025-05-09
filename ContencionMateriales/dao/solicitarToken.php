<?php
/* dao/solicitarTokenContencion.php
 *
 * Genera un token de recuperación, lo guarda en la BD y lo envía por correo.
 * Recibe POST ‘Username’ con el nombre de usuario o email.
 * Devuelve JSON { status, message, token } (token solo para debug en local).
 */

header('Content-Type: application/json');
require_once __DIR__ . '/conexionContencion.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status'=>'error','message'=>'Método no permitido.']);
    exit;
}

if (empty($_POST['Username'])) {
    echo json_encode(['status'=>'error','message'=>'Usuario requerido.']);
    exit;
}

$username = trim($_POST['Username']);

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

    // 2) Generar token y caducidad (1h)
    $token  = bin2hex(random_bytes(16));
    $expira = date('Y-m-d H:i:s', time() + 3600);

    // 3) Guardar en RecuperarContrasena
    $ins = $con->prepare(
        "INSERT INTO RecuperarContrasena 
        (IdUsuario, Token, Expira, TokenValido)
       VALUES (?, ?, ?, 1)"
    );
    $ins->bind_param("iss", $idUsuario, $token, $expira);
    $ins->execute();
    $ins->close();

    // 4) (*Aquí envías el correo con el enlace que incluya ?token=…*)

    echo json_encode([
        'status'    => 'success',
        'message'   => 'Revisa tu correo para recuperar la contraseña.',
        'token'     => $token
    ]);
} catch (Exception $e) {
    echo json_encode(['status'=>'error','message'=>'Error del servidor.']);
}
