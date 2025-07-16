<?php
/**
===============================================================================
@file       registroUsuarioContencion.php
@project    Programa de Contención de Materiales
@module     Autenticación de Usuarios
@purpose    Registrar nuevos usuarios enviados desde el formulario de registro.
@description
Este script maneja las solicitudes POST enviadas desde el frontend cuando
un usuario desea registrarse. Realiza validaciones de los datos recibidos,
verifica que el nombre de usuario no esté duplicado en la base de datos,
y si todo es correcto, guarda el nuevo usuario con el rol predeterminado.

➤ Se invoca desde JS en: inicioSesionContecion.js (modo registro)
➤ Depende del archivo de conexión: conexionContencion.php
➤ Retorna un JSON con el estado del registro y mensaje personalizado

⚠️ Nota: La contraseña no está cifrada actualmente, se almacena en texto plano.
Se recomienda aplicar `password_hash()` para producción segura.

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

// Iniciar sesión y configurar entorno
session_start();
include_once("conexionContencion.php");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
header('Content-Type: application/json');

// ─────────────────────────────────────────
// Validar método POST y campos obligatorios
// ─────────────────────────────────────────
$response = ['status' => 'error', 'message' => 'Método no permitido.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['Username'], $_POST['Nombre'], $_POST['Contrasena'])) {
        $username   = trim($_POST['Username']);
        $nombre     = trim($_POST['Nombre']);
        $contrasena = trim($_POST['Contrasena']);
        $idRol      = 1; // Rol por defecto para usuario normal

        // Validación de longitud mínima
        $error = validarDatos($username, $nombre, $contrasena);
        if ($error) {
            $response = ['status' => 'error', 'message' => $error];
        } else {
            // Intentar registrar al usuario
            $response = registrarUsuario($username, $nombre, $contrasena, $idRol);
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Faltan campos obligatorios.'];
    }
}

// Devolver respuesta al frontend
echo json_encode($response);
exit;

/* ─────────────────────────────────────────
   Función: validarDatos
   Verifica que los datos cumplan reglas mínimas
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
   Función: registrarUsuario
   Inserta el nuevo usuario en la base de datos
───────────────────────────────────────── */
function registrarUsuario(string $username, string $nombre, string $contrasena, int $rol): array {
    try {
        // Conexión a BD
        $con = new LocalConector();
        $conn = $con->conectar();

        // Verificar existencia previa del usuario
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
