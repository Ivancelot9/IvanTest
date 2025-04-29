<?php
/* --- PHP: obtenerEncargados.php ---
 *
 * @file obtenerEncargados.php
 * @description
 * Recupera la lista de encargados (supervisores y shift leaders) desde la tabla `Encargado`.
 * Devuelve un JSON con un array de objetos que contienen:
 *  - IdEncargado     (int)    Identificador del encargado
 *  - NombreEncargado (string) Nombre completo del encargado
 *  - Tipo            (string) 'Supervisor' o 'Shift Leader'
 *
 * Flujo:
 *  1. Iniciar/reanudar sesión PHP (session_start) por si se usa validación basada en sesión.
 *  2. Incluir conexión a la BD (LocalConector).
 *  3. Configurar header JSON.
 *  4. Establecer la conexión MySQLi.
 *  5. Preparar y ejecutar SELECT para obtener IdEncargado, NombreEncargado y Tipo.
 *  6. Recorrer el resultado y acumular en un array.
 *  7. Devolver el array como JSON.
 *  8. Cerrar conexión.
 *
 * Requiere:
 *  - conexion.php con la clase LocalConector::conectar()
 *  - Tabla `Encargado` con columnas `IdEncargado`, `NombreEncargado`, `Tipo`
 *  - Extensión MySQLi habilitada
 */
session_start();
include_once("conexion.php"); // 🔥 Incluir la conexión correctamente

header('Content-Type: application/json');

/* ─────────────────────────────────────────
   4. Conectar a la base de datos
───────────────────────────────────────── */
$conector = new LocalConector();
$conn = $conector->conectar();

// 5. Verificar que la conexión se estableció correctamente
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión a la base de datos"]);
    exit;
}

/* ─────────────────────────────────────────
   6. Ejecutar consulta SELECT
───────────────────────────────────────── */

$sql = "SELECT IdEncargado, NombreEncargado, Tipo FROM Encargado ORDER BY Tipo, NombreEncargado";
$result = $conn->query($sql);

$encargados = [];

/* ─────────────────────────────────────────
   7. Procesar resultados
───────────────────────────────────────── */

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $encargados[] = $row;
    }
}
/* ─────────────────────────────────────────
   8. Devolver JSON de encargados
───────────────────────────────────────── */

// Devolver los datos en formato JSON
echo json_encode($encargados);
/* ─────────────────────────────────────────
   9. Cerrar conexión
───────────────────────────────────────── */

$conn->close();
?>
