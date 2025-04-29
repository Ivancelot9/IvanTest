<?php

/* --- PHP: obtenerArea.php ---
 *
 * @file obtenerArea.php
 * @description
 * Recupera todas las áreas disponibles de la tabla `Area` en la base de datos.
 * Devuelve un JSON con un array de objetos que contienen:
 *  - IdArea     (int)   Identificador del área
 *  - NombreArea (string) Nombre descriptivo del área
 *
 * Flujo:
 *  1. Incluir conexión a la BD y configurar header JSON.
 *  2. Conectar a la base de datos usando LocalConector.
 *  3. Preparar y ejecutar la consulta SELECT.
 *  4. Recorrer resultados y almacenar en array.
 *  5. Devolver el array como JSON.
 *  6. Manejar excepciones devolviendo JSON con estado de error.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla `Area` con columnas `IdArea`, `NombreArea`
 *  - Extensión MySQLi habilitada
 */

include_once("conexion.php"); // 🔥 Conexión a la BD

header("Content-Type: application/json");

try {
    /* ─────────────────────────────────────────
       2. Conectar a la base de datos
    ────────────────────────────────────────── */
    $con = new LocalConector();
    $conn = $con->conectar();

    /* ─────────────────────────────────────────
       3. Preparar y ejecutar SELECT de áreas
    ────────────────────────────────────────── */

    $query = $conn->prepare("SELECT IdArea, NombreArea FROM Area ORDER BY NombreArea");
    $query->execute();
    $result = $query->get_result();

    /* ─────────────────────────────────────────
      4. Recorrer resultados
   ────────────────────────────────────────── */

    $areas = [];

    while ($row = $result->fetch_assoc()) {
        $areas[] = $row;
    }

    /* ─────────────────────────────────────────
       5. Devolver JSON de áreas
    ────────────────────────────────────────── */

    echo json_encode($areas);

    $query->close();
    $conn->close();
} catch (Exception $e) {
    /* ─────────────────────────────────────────
      6. Manejo de excepciones
   ────────────────────────────────────────── */
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}


