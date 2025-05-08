<?php
session_start();
include_once("conexionContencion.php");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
header('Content-Type: application/json');

// ─────────────────────────────────────────
// Validar método POST y campos
// ─────────────────────────────────────────
$response = ['status' => 'error', 'message' => 'Método no permitido.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['Username'], $_POST['Nombre'], $_POST['Contrasena'])) {
        $username   = trim($_POST['Username']);
        $nombre     = trim($_POST['Nombre']);
        $contrasena = trim($_POST['Contrasena']);
        $idRol      = 1; // Usuario normal

        // Validación básica
        $error = validarDatos($username, $nombre, $contrasena);
        if ($error) {
            $response = ['status' => 'error', 'message' => $error];
        } else {
            // Registrar en BD
            $response = registrarUsuario($username, $nombre, $contrasena, $idRol);
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Faltan campos obligatorios.'];
    }
}

echo json_encode($response);
exit;

/* ─────────────────────────────────────────
   Función de validación
───────────────────────────────────────── */
function validarDatos(string $user, string $nombre, string $pwd): ?string {
    if (strlen($user) < 4) {
        return "El nombre de usuario debe tener al menos 4 caracteres.";
    }
    if (strlen($nombre) < 3) {
        return "El nombre debe contener al menos 3 caracteres.";
    }
    if (strlen($pwd) < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
    }
    return null;
}

/* ─────────────────────────────────────────
   Registro en base de datos con bind_param
───────────────────────────────────────── */
function registrarUsuario(string $username, string $nombre, string $contrasena, int $rol): array {
    try {
        $con = new LocalConector();
        $conn = $con->conectar();

        // Verificar si ya existe el usuario
        $stmt = $conn->prepare("SELECT COUNT(*) FROM Usuario WHERE Username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($existe);
        $stmt->fetch();
        $stmt->close();

        if ($existe > 0) {
            return ['status' => 'error', 'message' => 'El nombre de usuario ya está registrado.'];
        }

        // Insertar nuevo usuario
        $insert = $conn->prepare("INSERT INTO Usuario (Username, Nombre, Contrasena, IdRol) VALUES (?, ?, ?, ?)");
        $insert->bind_param("sssi", $username, $nombre, $contrasena, $rol);
        $insert->execute();
        $insert->close();

        return ['status' => 'success', 'message' => 'Usuario registrado exitosamente.'];
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage()];
    }
}
