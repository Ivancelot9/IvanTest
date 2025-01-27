<?php
session_start(); // Iniciar sesión
include_once("conexion.php"); // Incluir la conexión a la base de datos

header('Content-Type: application/json');

// Revisión del método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['NumNomina'], $_POST['Nombre'], $_POST['Contrasena'])) {
        $NumNomina = trim($_POST['NumNomina']);
        $Nombre = trim($_POST['Nombre']);
        $Contrasena = trim($_POST['Contrasena']);

        // Validación centralizada
        $validacion = validarDatos($NumNomina, $Nombre, $Contrasena);
        if ($validacion) {
            echo json_encode($validacion);
            exit;
        }

        // Registro en la base de datossss
        $response = registrarAdminEnDB($NumNomina, $Nombre, $Contrasena, 1);
    } else {
        $response = ['status' => 'error', 'message' => 'Datos incompletos.'];
    }
} else {
    $response = ['status' => 'error', 'message' => 'Se requiere método POST.'];
}

// Respuesta JSON
echo json_encode($response);
exit();

// Función de validación
function validarDatos(string $NumNomina, string $Nombre, string $Contrasena): ?array {
    if (!ctype_digit($NumNomina) || strlen($NumNomina) !== 8) {
        return ['status' => 'error', 'message' => 'El número de nómina debe ser un número de 8 dígitos.'];
    }
    if (empty($Nombre) || strlen($Nombre) < 3) {
        return ['status' => 'error', 'message' => 'El nombre debe contener al menos 3 caracteres.'];
    }
    if (empty($Contrasena) || strlen($Contrasena) < 6) {
        return ['status' => 'error', 'message' => 'La contraseña debe tener al menos 6 caracteres.'];
    }
    return null;
}

// Función para registrar administrador jeje
function registrarAdminEnDB(string $NumNomina, string $Nombre, string $Contrasena, int $IdRol): array {
    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            return ['status' => 'error', 'message' => 'Error al conectar a la base de datos.'];
        }



        $query = $conex->prepare("INSERT INTO Usuario (NumeroNomina, Nombre, Contrasena, IdRol) VALUES (?, ?, ?, ?)");
        if (!$query) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta.'];
        }

        $query->bind_param("sssi", $NumNomina, $Nombre, $Contrasena, $idRol);
        $resultado = $query->execute();

        $query->close();
        $conex->close();

        if ($resultado) {
            return ['status' => 'success', 'message' => 'Administrador registrado exitosamente.'];
        } else {
            return ['status' => 'error', 'message' => 'Error al registrar administrador.'];
        }
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()];
    }
}