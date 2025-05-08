<?php
session_start();
include_once("conexionContencion.php");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
header('Content-Type: application/json');

// ─────────────────────────────────────────
// Validación del método y campos POST
// ─────────────────────────────────────────
$response = ['status' => 'error', 'message' => 'Método no permitido.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['Username'], $_POST['Contrasena'], $_POST['tab_id'])) {
        $username   = trim($_POST['Username']);
        $contrasena = trim($_POST['Contrasena']);
        $tab_id     = trim($_POST['tab_id']);

        if ($username === '' || $contrasena === '') {
            $response = ['status' => 'error', 'message' => 'Faltan campos obligatorios.'];
        } else {
            $respuesta = validarCredenciales($username, $contrasena);

            if ($respuesta['status'] === 'success') {
                $_SESSION['usuariosPorPestana'][$tab_id] = [
                    'Username'   => $username,
                    'Conectado'  => true,
                    'Nombre'     => $respuesta['nombre'],
                    'Rol'        => $respuesta['rol']
                ];
            }

            $response = $respuesta;
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Datos incompletos o tab_id faltante.'];
    }
}

echo json_encode($response);
exit;

/* ─────────────────────────────────────────
   Función: validarCredenciales
───────────────────────────────────────── */
function validarCredenciales(string $username, string $pwd): array {
    try {
        $con = new LocalConector();
        $conn = $con->conectar();

        $query = $conn->prepare("SELECT Contrasena, Nombre, IdRol FROM Usuario WHERE Username = ?");
        $query->bind_param("s", $username);
        $query->execute();
        $result = $query->get_result();

        if ($result->num_rows === 1) {
            $usuario = $result->fetch_assoc();

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
        return ['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage()];
    }
}
