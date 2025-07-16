<?php
/**
===============================================================================
@file       validacionUsuarioContencion.php
@project    Programa de Contención de Materiales
@module     Autenticación de Usuarios
@purpose    Validar las credenciales de inicio de sesión enviadas por el frontend.
@description
Este script recibe peticiones POST desde el formulario de login y verifica
las credenciales del usuario contra la base de datos. Si la validación es
exitosa, crea una sesión personalizada por pestaña usando `tab_id`, donde
se almacena la información del usuario autenticado (nombre, rol, conexión).

➤ Se invoca desde JS en: inicioSesionContecion.js (modo login)
➤ Depende del archivo de conexión: conexionContencion.php
➤ Retorna un JSON con estado de éxito o error y mensaje correspondiente

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

// Inicia sesión y configura encabezados
session_start();
include_once("conexionContencion.php");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
header('Content-Type: application/json');

// ─────────────────────────────────────────
// Validación del método y campos POST
// ─────────────────────────────────────────
$response = ['status' => 'error', 'message' => 'Método no permitido.'];

// Solo acepta solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifica que los campos requeridos existan
    if (isset($_POST['Username'], $_POST['Contrasena'], $_POST['tab_id'])) {
        $username   = trim($_POST['Username']);
        $contrasena = trim($_POST['Contrasena']);
        $tab_id     = trim($_POST['tab_id']);

        // Validación básica de campos vacíos
        if ($username === '' || $contrasena === '') {
            $response = ['status' => 'error', 'message' => 'Faltan campos obligatorios.'];
        } else {
            // Llamada a función de validación
            $respuesta = validarCredenciales($username, $contrasena);

            // Si es válido, guarda sesión única por pestaña
            if ($respuesta['status'] === 'success') {
                $_SESSION['usuariosPorPestana'][$tab_id] = [
                    'Username'   => $username,
                    'Conectado'  => true,
                    'Nombre'     => $respuesta['nombre'],
                    'Rol'        => $respuesta['rol']
                ];
            }

            // Devuelve el resultado al frontend
            $response = $respuesta;
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Datos incompletos o tab_id faltante.'];
    }
}

// Respuesta en formato JSON
echo json_encode($response);
exit;

/* ─────────────────────────────────────────
   Función: validarCredenciales
   Valida si el usuario y contraseña coinciden
───────────────────────────────────────── */
function validarCredenciales(string $username, string $pwd): array {
    try {
        // Conexión a la base de datos
        $con = new LocalConector();
        $conn = $con->conectar();

        // Consulta preparada para prevenir inyección SQL
        $query = $conn->prepare("SELECT Contrasena, Nombre, IdRol FROM Usuario WHERE Username = ?");
        $query->bind_param("s", $username);
        $query->execute();
        $result = $query->get_result();

        // Si existe el usuario...
        if ($result->num_rows === 1) {
            $usuario = $result->fetch_assoc();

            // Verifica que la contraseña coincida exactamente
            if ($usuario['Contrasena'] === $pwd) {
                return [
                    'status'  => 'success',
                    'message' => 'Inicio de sesión exitoso.',
                    'nombre'  => $usuario['Nombre'],
                    'rol'     => $usuario['IdRol']
                ];
            } else {
                return ['status' => 'error', 'message' => 'Contraseña incorrecta.'];
            }
        } else {
            return ['status' => 'error', 'message' => 'El usuario no existe.'];
        }
    } catch (Exception $e) {
        // Manejo de errores de conexión o ejecución
        return ['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage()];
    }
}
