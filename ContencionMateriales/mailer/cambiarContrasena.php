<?php
session_start();
include_once("../dao/conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (empty($_POST['Username']) || empty($_POST['Token']) || empty($_POST['NuevaContrasena'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios.']);
    exit;
}

$username       = trim($_POST['Username']);
$token          = trim($_POST['Token']);
$nuevaPassword  = trim($_POST['NuevaContrasena']);

if (strlen($nuevaPassword) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'La nueva contraseña debe tener al menos 6 caracteres.']);
    exit;
}

try {
    $con = (new LocalConector())->conectar();

    // Obtener el IdUsuario
    $stmt = $con->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($idUsuario);
    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
        exit;
    }
    $stmt->close();

    // Validar el token
    $validar = $con->prepare("SELECT IdRecuperacion FROM RecuperarContrasena WHERE IdUsuario = ? AND Token = ? AND TokenValido = 1 AND Expira > NOW()");
    $validar->bind_param("is", $idUsuario, $token);
    $validar->execute();
    $validar->bind_result($idRecuperacion);
    if (!$validar->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Token inválido o expirado.']);
        exit;
    }
    $validar->close();

    // Actualizar contraseña
    $actualizar = $con->prepare("UPDATE Usuario SET Contrasena = ? WHERE IdUsuario = ?");
    $actualizar->bind_param("si", $nuevaPassword, $idUsuario);
    $actualizar->execute();
    $actualizar->close();

    // Invalidar el token usado
    $anular = $con->prepare("UPDATE RecuperarContrasena SET TokenValido = 0 WHERE IdRecuperacion = ?");
    $anular->bind_param("i", $idRecuperacion);
    $anular->execute();
    $anular->close();

    echo json_encode(['status' => 'success', 'message' => 'Contraseña actualizada correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor.']);
}
