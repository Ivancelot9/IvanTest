<?php
/* --- PHP: obtenerUsuario.php ---
 *
 * @file obtenerUsuario.php
 * @description
 * Obtiene los datos del usuario autenticado a partir de su `tab_id`.
 * Devuelve un JSON con:
 *  - status: 'success' o 'error'
 *  - nombre
 *  - nomina
 *
 * Flujo:
 *  1. Iniciar/resumir la sesión PHP.
 *  2. Incluir la conexión a la BD y configurar header JSON.
 *  3. Validar que se reciba GET['tab_id'].
 *  4. Comprobar que exista $_SESSION['usuariosPorPestana'][tab_id].
 *  5. Leer el Número de Nómina de la sesión.
 *  6. Preparar y ejecutar SELECT para Nombre y NumeroNomina.
 *  7. Devolver JSON con los datos o mensaje de error.
 *  8. Capturar excepciones y devolver JSON de error.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - $_SESSION['usuariosPorPestana'][tab_id]['NumNomina'] inicializado en login
 */
session_start();
include_once("conexion.php");
header('Content-Type: application/json');

// 3. Validar parámetro 'tab_id'
if (!isset($_GET['tab_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Falta tab_id.']);
    exit;
}

$tab_id = $_GET['tab_id'];
// 4. Verificar sesión de la pestaña

// ✅ Verificar que exista la sesión de esa pestaña
if (!isset($_SESSION['usuariosPorPestana'][$tab_id])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no encontrada.']);
    exit;
}
// 5. Obtener Número de Nómina de la sesión
$NumNomina = $_SESSION['usuariosPorPestana'][$tab_id]['NumNomina'];

try {
    // 6. Conectar BD y preparar consulta
    $con = new LocalConector();
    $conex = $con->conectar();

    $query = $conex->prepare("SELECT Nombre, NumeroNomina FROM Usuario WHERE NumeroNomina = ?");
    $query->bind_param("s", $NumNomina);
    // 7. Ejecutar y procesar resultado
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
    // 8. Manejo de excepciones
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
