<?php
/* --- PHP: modficarDatosPersonales.php ---
 *
 * @file modficarDatosPersonales.php
 * @description
 * Actualiza el nombre de usuario en su perfil a partir de la sesión de pestaña.
 * Recibe JSON con:
 *  - nombre (string): nuevo nombre del usuario
 *
 * Flujo:
 *  1. Iniciar sesión PHP y cargar conexión.
 *  2. Verificar que se reciba `tab_id` por GET.
 *  3. Confirmar que `tab_id` exista en $_SESSION['usuariosPorPestana'].
 *  4. Obtener Número de Nómina asociado a esa pestaña.
 *  5. Leer y decodificar JSON de entrada.
 *  6. Validar que `nombre` no esté vacío y tenga formato correcto.
 *  7. Sanitizar `nombre` con htmlspecialchars.
 *  8. Ejecutar UPDATE preparado en tabla `Usuario`.
 *  9. Devolver JSON con estado de éxito o error.
 * 10. Capturar excepciones y devolver error en JSON.
 *
 * Requiere:
 *  - `session_start()` para manejar la sesión.
 *  - Array `$_SESSION['usuariosPorPestana'][tab_id]['NumNomina']`.
 *  - conexion.php con clase LocalConector::conectar().
 *  - Tabla `Usuario` con columnas `NumeroNomina` y `Nombre`.
 */
session_start();
include_once("conexion.php");
header("Content-Type: application/json");

// 2. Validar que venga el tab_id
if (!isset($_GET['tab_id'])) {
    echo json_encode(["status" => "error", "message" => "Falta el tab_id."]);
    exit;
}

$tab_id = $_GET['tab_id'];

// 3. Verificar que exista la sesión de esa pestaña
if (!isset($_SESSION['usuariosPorPestana'][$tab_id])) {
    echo json_encode(["status" => "error", "message" => "No has iniciado sesión correctamente."]);
    exit;
}
// 4. Obtener Número de Nómina de la sesión
$NumNomina = $_SESSION['usuariosPorPestana'][$tab_id]['NumNomina'];

// 5. Leer JSON enviado por POST
$data = json_decode(file_get_contents("php://input"), true);


// 6. Validar que `nombre` exista y no esté vacío
if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
    echo json_encode(["status" => "error", "message" => "El nombre no puede estar vacío."]);
    exit;
}

$nuevoNombre = trim($data['nombre']);

// 7. Validar formato de Número de Nómina
if (!is_numeric($NumNomina)) {
    echo json_encode(["status" => "error", "message" => "Número de nómina inválido."]);
    exit;
}

// 8. Validar formato de `nombre` (solo letras, espacios y tildes)
if (!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/", $nuevoNombre)) {
    echo json_encode(["status" => "error", "message" => "El nombre solo puede contener letras y espacios."]);
    exit;
}
// 9. Sanitizar `nombre` para evitar XSS
$nuevoNombre = htmlspecialchars($nuevoNombre, ENT_QUOTES, 'UTF-8');

try {
    // 10. Conectar a la BD y preparar UPDATE
    $con = new LocalConector();
    $conex = $con->conectar();

    $query = $conex->prepare("UPDATE Usuario SET Nombre = ? WHERE NumeroNomina = ?");
    $query->bind_param("ss", $nuevoNombre, $NumNomina);
    // 11. Ejecutar y devolver resultado
    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Nombre actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el nombre."]);
    }

    $query->close();
    $conex->close();
} catch (Exception $e) {
    // 12. Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
