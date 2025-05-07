<?php
/* --- PHP: conexionContencion.php ---
 *
 * @file conexionContencion.php
 * @description
 * Clase LocalConector para la conexión a la base de datos del sistema
 * de Contención de Materiales. Misma estructura que el original, pero
 * separada para evitar conflictos entre sistemas.
 */

class LocalConector
{
    // ──────────────────────────────────────
    // Propiedades de conexión (ajusta a tu BD nueva)
    // ──────────────────────────────────────
    private $host = "127.0.0.1:3306";             // Servidor MySQL
    private $usuario = "u909553968_IvanMC";         // Tu usuario
    private $password = "Ivan91482";      // Tu contraseña
    private $database = "u909553968_ContencionMat";              // Nombre de la nueva BD
    private $conexion;

    // ──────────────────────────────────────
    // Método: conectar()
    // ──────────────────────────────────────
    public function conectar()
    {
        date_default_timezone_set('America/Mexico_City');

        $this->conexion = mysqli_connect(
            $this->host,
            $this->usuario,
            $this->password,
            $this->database
        );

        if ($this->conexion->connect_error) {
            die("❌ Error al conectar con la base de datos de contención.");
        }

        $this->conexion->query("SET time_zone = '-06:00'");
        return $this->conexion;
    }
}
