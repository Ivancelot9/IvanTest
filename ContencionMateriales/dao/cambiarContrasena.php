<?php
/**
===============================================================================
@file       cambiarContrasena.php
@project    Programa de Contención de Materiales
@module     Recuperación de Contraseña
@purpose    Validar el token enviado y actualizar la contraseña del usuario.
@description
Este script recibe un token, nombre de usuario y nueva contraseña desde el
frontend. Verifica que el token esté activo, que pertenezca al usuario y
que no haya expirado. Si es válido, actualiza la contraseña del usuario en
la base de datos y marca el token como inválido para evitar reutilización.

➤ Se invoca desde JS en: inicioSesionContecion.js (flujo recuperación)
➤ Depende de la tabla `RecuperarContrasena` y la entidad `Usuario`
➤ Devuelve un JSON con estado y mensaje de éxito o error

⚠️ Nota: La contraseña aún se guarda en texto plano. Para producción segura
se recomienda aplicar hash (`password_hash`) antes de guardar.

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

// Inicia sesión y prepara la conexión
session_start();
include_once("conexionContencion.php");

header('Content-Type: application/json; charset=UTF-8');

// ─────────────────────────────────────────
// Validación de método HTTP
// ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

// ─────────────────────────────────────────
// Validación de campos obligatorios
// ─────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // 1. Verifica que el token sea válido y vigente
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // 2. Actualiza la contraseña del usuario
    // ─────────────────────────────────────────────
    $update = $con->prepare("UPDATE Usuario SET Contrasena = ? WHERE IdUsuario = ?");
    $update->bind_param("si", $nuevaPwd, $idUsuario);
    $update->execute();
    $update->close();

    // ─────────────────────────────────────────────
    // 3. Invalida el token una vez utilizado
    // ─────────────────────────────────────────────
    $invalidate = $con->prepare("UPDATE RecuperarContrasena SET TokenValido = 0 WHERE Token = ?");
    $invalidate->bind_param("s", $token);
    $invalidate->execute();
    $invalidate->close();

    echo json_encode(['status' => 'success', 'message' => 'Contraseña actualizada correctamente.']);
} catch (Exception $e) {
    // Error en servidor o base de datos
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor.']);
}
