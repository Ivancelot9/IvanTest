<?php
session_start();
// Iniciar sesión
include_once("conexion.php");

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Revisar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validar que todos los datos requeridos están presentes
    if (isset($_POST['NumNomina'], $_POST['Nombre'], $_POST['Contrasena'])) {
        // Obtener los datos del formulario
        $NumNomina = trim($_POST['NumNomina']);
        $Nombre = trim($_POST['Nombre']);
        $Contrasena = trim($_POST['Contrasena']);

        // Validar formato de los datos
        if (!ctype_digit($NumNomina) || strlen($NumNomina) !== 8) {
            echo json_encode(['status' => 'error', 'message' => 'El número de nómina debe ser un número de 8 dígitos.']);
            exit;
        }
        if (empty($Nombre) || strlen($Nombre) < 3) {
            echo json_encode(['status' => 'error', 'message' => 'El nombre debe contener al menos 3 caracteres.']);
            exit;
        }
        if (empty($Contrasena) || strlen($Contrasena) < 6) {
            echo json_encode(['status' => 'error', 'message' => 'La contraseña debe tener al menos 6 caracteres.']);
            exit;
        }

        // Registrar al usuario en la base de datos
        $response = registrarUsuarioEnDB($NumNomina, $Nombre, $Contrasena);
    } else {
        $response = ['status' => 'error', 'message' => 'Datos incompletos.'];
    }
} else {
    $response = ['status' => 'error', 'message' => 'Se requiere método POST.'];
}

// Devolver respuesta en formato JSON
echo json_encode($response);
exit();

// Función para registrar al usuario en la base de datos
function registrarUsuarioEnDB($NumNomina, $Nombre, $Contrasena) {
    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            return ['status' => 'error', 'message' => 'Error al conectar a la base de datos.'];
        }
        // Hashear la contraseña
        $hashedPassword = password_hash($Contrasena, PASSWORD_DEFAULT);

        // Preparar la consulta
        $insertUsuario = $conex->prepare("INSERT INTO Usuario (IdUsuario, Nombre, Contraseña) VALUES (?, ?, ?)");

        if (!$insertUsuario) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta.'];
        }

        $insertUsuario->bind_param("sss", $NumNomina, $Nombre, $hashedPassword);
        $resultado = $insertUsuario->execute();

        $insertUsuario->close();
        $conex->close();

        if ($resultado) {
            return ['status' => 'success', 'message' => 'Usuario registrado exitosamente.'];
        } else {
            return ['status' => 'error', 'message' => 'Error al registrar usuario.'];
        }
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()];
    }
}
