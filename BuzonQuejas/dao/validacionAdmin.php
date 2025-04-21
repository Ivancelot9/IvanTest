<?php
session_start(); // Iniciar sesión
include_once("conexion.php"); // Incluir la conexión a la base de datos

// Verificar si el método es POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['NumNomina'], $_POST['Contrasena'])) {
        $NumNomina = trim($_POST['NumNomina']);
        $Contrasena = trim($_POST['Contrasena']);

        // Validar que los campos no estén vacíos
        if (empty($NumNomina) || empty($Contrasena)) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
            exit;
        }

        // Validar que el Número de Nómina tenga 8 dígitos
        if (!ctype_digit($NumNomina) || strlen($NumNomina) !== 8) {
            echo json_encode(['status' => 'error', 'message' => 'El número de nómina debe tener 8 dígitos.']);
            exit;
        }

        // ✅ Verificar si ya hay una sesión activa con otro usuario
        if (isset($_SESSION['NumNomina']) && $_SESSION['NumNomina'] !== $NumNomina) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Ya hay una sesión activa con otro usuario (' . $_SESSION['NumNomina'] . '). Cierra sesión primero.'
            ]);
            exit;
        }

        // Validar las credenciales en la base de datos
        $response = validarCredencialesEnDB($NumNomina, $Contrasena);

        if ($response['status'] === 'success') {
            $_SESSION['NumNomina'] = $NumNomina;
            $_SESSION['Contrasena'] = $Contrasena;
            $_SESSION['Conectado'] = true; // Bandera de sesión activa

            echo json_encode(['status' => 'success', 'message' => 'Inicio de sesión exitoso.']);
        } else {
            echo json_encode($response);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Se requiere método POST.']);
}

exit();


// 🧠 Función para validar las credenciales en la base de datos
function validarCredencialesEnDB(string $NumNomina, string $Contrasena): array {
    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            return ['status' => 'error', 'message' => 'Error al conectar a la base de datos.'];
        }

        // Consulta para buscar el usuario
        $query = $conex->prepare("SELECT Contrasena FROM Usuario WHERE NumeroNomina = ?");
        if (!$query) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta.'];
        }

        $query->bind_param("s", $NumNomina);
        $query->execute();
        $resultado = $query->get_result();

        if ($resultado->num_rows === 1) {
            $usuario = $resultado->fetch_assoc();

            // Comparar contraseñas
            if ($usuario['Contrasena'] === $Contrasena) {
                return ['status' => 'success', 'message' => 'Inicio de sesión exitoso.'];
            } else {
                return ['status' => 'error', 'message' => 'Contraseña incorrecta.'];
            }
        } else {
            return ['status' => 'error', 'message' => 'El usuario no existe.'];
        }
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()];
    } finally {
        $query->close();
        $conex->close();
    }
}
