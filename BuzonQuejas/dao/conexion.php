<?php
/* --- PHP: conexion.php ---
 *
 * @file conexion.php
 * @description
 * Clase LocalConector para gestionar la conexión a la base de datos MySQL:
 *  1. Define las credenciales y el host de la BD.
 *  2. Configura la zona horaria de PHP.
 *  3. Establece la conexión usando mysqli.
 *  4. Ajusta la zona horaria a nivel de conexión SQL.
 *  5. Devuelve el objeto de conexión listo para consultas.
 *
 * Propiedades:
 *  - $host      Dirección y puerto del servidor MySQL.
 *  - $usuario   Nombre de usuario de la base de datos.
 *  - $password  Contraseña del usuario.
 *  - $database  Nombre de la base de datos.
 *
 * Método público:
 *  conectar():
 *    • Llama a date_default_timezone_set('America/Mexico_City').
 *    • Intenta conectar con mysqli_connect().
 *    • En caso de error, detiene la ejecución con die().
 *    • Ejecuta SET time_zone = '-06:00' en la conexión.
 *    • Retorna el objeto mysqli para uso posterior.
 *
 * Uso:
 *  $con = new LocalConector();
 *  $conn = $con->conectar();
 */

class LocalConector {
    /* ─────────────────────────────────────────
       Propiedades de conexión
    ───────────────────────────────────────── */
    private $host     = "127.0.0.1:3306";               // Servidor MySQL y puerto
    private $usuario  = "u909553968_IvanM";            // Usuario de la BD
    private $password = "Ivan91482";                   // Contraseña de la BD
    private $database = "u909553968_PruebasIvan";      // Nombre de la BD
    private $conexion;                                 // Objeto mysqli

    /* ─────────────────────────────────────────
       Método: conectar
       Establece y devuelve la conexión MySQLi
    ───────────────────────────────────────── */
    public function conectar() {
        // 1. Forzar la zona horaria de PHP antes de operar con fechas
        date_default_timezone_set('America/Mexico_City');

        // 2. Intentar la conexión MySQLi
        $this->conexion = mysqli_connect(
            $this->host,
            $this->usuario,
            $this->password,
            $this->database
        );

        // 3. Verificar errores de conexión
        if ($this->conexion->connect_error) {
            // Detener ejecución si hay fallo
            die("Error al conectar con la base de datos");
        }

        // 4. Ajustar la zona horaria de la sesión SQL a -06:00
        $this->conexion->query("SET time_zone = '-06:00'");

        // 5. Devolver el objeto mysqli
        return $this->conexion;
    }
}
