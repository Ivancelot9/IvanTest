<?php
session_start(); // Iniciar sesión
include_once("conexion.php");
header('Content-Type: application/json');

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['NumNomina'])) {
    echo json_encode(['status' => 'error', 'message' => 'No has iniciado sesión.']);
    exit;
}

$NumNomina = $_SESSION['NumNomina']; // Obtener el número de nómina de la sesión

try {
    // Conectar a la base de datos
    $con = new Conexion();
    $conex = $con->conectar();

    // Consultar datos del usuario en la tabla `Usuario`
    $query = $conex->prepare("SELECT Nombre, NumeroNomina FROM Usuario WHERE NumeroNomina = ?");
    $query->bind_param("s", $NumNomina);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'nombre' => $user['Nombre'], 'nomina' => $user['NumeroNomina']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
    }

    $query->close();
    $conex->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>
