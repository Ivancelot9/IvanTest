<?php
session_start();
include_once("conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (empty($_POST['Username']) || empty($_POST['Token']) || empty($_POST['NuevaContrasena'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan campos requeridos.']);
    exit;
}

$username = trim($_POST['Username']);
$token    = trim($_POST['Token']);
$nuevaPwd = trim($_POST['NuevaContrasena']);

if (strlen($nuevaPwd) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'La nueva contraseña debe tener al menos 6 caracteres.']);
    exit;
}

try {
    $con = (new LocalConector())->conectar();

    // 1. Verificar que el token esté asociado al usuario y siga vigente
    $query = $con->prepare(
        "SELECT r.IdUsuario FROM RecuperarContrasena r
         INNER JOIN Usuario u ON r.IdUsuario = u.IdUsuario
         WHERE u.Username = ? AND r.Token = ? AND r.TokenValido = 1 AND r.Expira > NOW()"
    );
    $query->bind_param("ss", $username, $token);
    $query->execute();
    $query->bind_result($idUsuario);

    if (!$query->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Token inválido o expirado.']);
        exit;
    }
    $query->close();

    // 2. Actualizar contraseña
    $update = $con->prepare("UPDATE Usuario SET Contrasena = ? WHERE IdUsuario = ?");
    $update->bind_param("si", $nuevaPwd, $idUsuario);
    $update->execute();
    $update->close();

    // 3. Invalidar el token usado
    $invalidate = $con->prepare("UPDATE RecuperarContrasena SET TokenValido = 0 WHERE Token = ?");
    $invalidate->bind_param("s", $token);
    $invalidate->execute();
    $invalidate->close();

    echo json_encode(['status' => 'success', 'message' => 'Contraseña actualizada correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor.']);
}
