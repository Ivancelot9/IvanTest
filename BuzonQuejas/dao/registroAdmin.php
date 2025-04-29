<?php
/* --- PHP: registroAdmin.php ---
 *
 * @file registroAdmin.php
 * @description
 * Gestiona el registro de nuevos administradores en la base de datos.
 * Recibe un formulario POST con:
 *  - NumNomina   (string) Número de nómina de 8 dígitos
 *  - Nombre      (string) Nombre completo del administrador
 *  - Contrasena  (string) Contraseña (mínimo 6 caracteres)
 *
 * Flujo:
 *  1. Iniciar sesión PHP y configurar errores MySQLi.
 *  2. Verificar método POST y campos obligatorios.
 *  3. Validar formato de los datos con validarDatos().
 *  4. Registrar en BD llamando a registrarAdminEnDB().
 *  5. Devolver respuesta JSON con status y mensaje.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla Roles (IdRol) y Usuario (NumeroNomina, Nombre, Contrasena, IdRol)
 *  - Extensión MySQLi con manejo de excepciones
 */
session_start(); // Iniciar sesión
include_once("conexion.php"); // Incluir la conexión a la base de datos
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
header('Content-Type: application/json');

// Revisión del método POST
/* ─────────────────────────────────────────
   2. Procesar petición POST
───────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['NumNomina'], $_POST['Nombre'], $_POST['Contrasena'])) {
        $NumNomina = trim($_POST['NumNomina']);
        $Nombre = trim($_POST['Nombre']);
        $Contrasena = trim($_POST['Contrasena']);
        $IdRol = 1; // Valor predeterminado para el rol

        // Validación centralizada
        $validacion = validarDatos($NumNomina, $Nombre, $Contrasena);
        if ($validacion) {
            echo json_encode($validacion);
            exit;
        }

        // 4. Registro en la base de datos
        $response = registrarAdminEnDB($NumNomina, $Nombre, $Contrasena, $IdRol);
    } else {
        $response = ['status' => 'error', 'message' => 'Datos incompletos.'];
    }
} else {
    $response = ['status' => 'error', 'message' => 'Se requiere método POST.'];
}

// 5. Enviar respuesta JSON
echo json_encode($response);
exit();

/* ─────────────────────────────────────────
   Función de validación de entrada
───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
   Función para insertar el administrador en BD
───────────────────────────────────────── */
function registrarAdminEnDB(string $NumNomina, string $Nombre, string $Contrasena, int $IdRol): array {
    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            return ['status' => 'error', 'message' => 'Error al conectar a la base de datos.'];
        }

        // Verifica que el rol con IdRol = 1 exista antes de insertar
        $rolQuery = $conex->prepare("SELECT COUNT(*) FROM Roles WHERE IdRol = ?");
        if (!$rolQuery) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta para verificar el rol.'];
        }
        $rolQuery->bind_param("i", $IdRol);
        $rolQuery->execute();
        $rolQuery->bind_result($rolExists);
        $rolQuery->fetch();
        $rolQuery->close();

        if ($rolExists === 0) {
            return ['status' => 'error', 'message' => 'El rol con IdRol = 1 no existe.'];
        }

        // Inserta el usuario con el IdRol validado
        $query = $conex->prepare("INSERT INTO Usuario (NumeroNomina, Nombre, Contrasena, IdRol) VALUES (?, ?, ?, ?)");
        if (!$query) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta para insertar el usuario.'];
        }

        $query->bind_param("sssi", $NumNomina, $Nombre, $Contrasena, $IdRol);
        $resultado = $query->execute();

        // ⚠️ Captura el error ANTES de cerrar
        $error = $query->errno;
        $query->close();
        $conex->close();

        if ($resultado) {
            return ['status' => 'success', 'message' => 'Administrador registrado exitosamente.'];
        } else {
            if ($error === 1062) {
                return ['status' => 'error', 'message' => 'Ese número de nómina ya está registrado.'];
            }
            return ['status' => 'error', 'message' => 'Error al registrar administrador.'];
        }
    }catch (mysqli_sql_exception $e) {
        if ($e->getCode() === 1062) {
            return ['status' => 'error', 'message' => 'Ese número de nómina ya está registrado.'];
        }
        return ['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()];
    }
}
