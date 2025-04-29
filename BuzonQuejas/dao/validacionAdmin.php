<?php
/* --- PHP: validacionAdmin.php ---
 *
 * @file validacionAdmin.php
 * @description
 * Valida el inicio de sesión de administradores mediante número de nómina y contraseña.
 * Permite sesiones por pestaña usando `tab_id`.
 *
 * Flujo:
 *  1. Iniciar sesión PHP y cargar conexión a BD.
 *  2. Comprobar método POST y existencia de NumNomina, Contrasena y tab_id.
 *  3. Validar que los campos no estén vacíos y que NumNomina tenga 8 dígitos.
 *  4. Llamar a validarCredencialesEnDB() para verificar credenciales en la tabla Usuario.
 *  5. Si éxito, guardar datos en $_SESSION['usuariosPorPestana'][tab_id] y devolver status success.
 *  6. En caso contrario, devolver el error correspondiente.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla `Usuario` con columnas `NumeroNomina`, `Contrasena`
 *  - Extensión MySQLi habilitada
 */
session_start();
include_once("conexion.php");

// 1. Verificar método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 2. Validar campos obligatorios
    if (isset($_POST['NumNomina'], $_POST['Contrasena'], $_POST['tab_id'])) {
        $NumNomina = trim($_POST['NumNomina']);
        $Contrasena = trim($_POST['Contrasena']);
        $tab_id = trim($_POST['tab_id']); // ✅ Identificador único por pestaña

        // 3. Validar contenido y formato
        if (empty($NumNomina) || empty($Contrasena)) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
            exit;
        }

        // Validar que el Número de Nómina tenga 8 dígitos
        if (!ctype_digit($NumNomina) || strlen($NumNomina) !== 8) {
            echo json_encode(['status' => 'error', 'message' => 'El número de nómina debe tener 8 dígitos.']);
            exit;
        }

        // Ya no bloqueamos sesiones por usuario (permitimos múltiples usuarios en diferentes pestañas)

        // Validar las credenciales en la base de datos
        $response = validarCredencialesEnDB($NumNomina, $Contrasena);

        if ($response['status'] === 'success') {
            // ✅ Guardar sesión bajo el tab_id
            $_SESSION['usuariosPorPestana'][$tab_id] = [
                'NumNomina' => $NumNomina,
                'Contrasena' => $Contrasena,
                'Conectado' => true
            ];

            echo json_encode(['status' => 'success', 'message' => 'Inicio de sesión exitoso.']);
        } else {
            echo json_encode($response);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos o tab_id faltante.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Se requiere método POST.']);
}

exit();


/* ─────────────────────────────────────────
   Función: validarCredencialesEnDB
   Valida NumNomina y Contrasena contra la tabla Usuario
───────────────────────────────────────── */
function validarCredencialesEnDB(string $NumNomina, string $Contrasena): array {
    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            return ['status' => 'error', 'message' => 'Error al conectar a la base de datos.'];
        }

        $query = $conex->prepare("SELECT Contrasena FROM Usuario WHERE NumeroNomina = ?");
        if (!$query) {
            return ['status' => 'error', 'message' => 'Error al preparar la consulta.'];
        }

        $query->bind_param("s", $NumNomina);
        $query->execute();
        $resultado = $query->get_result();

        if ($resultado->num_rows === 1) {
            $usuario = $resultado->fetch_assoc();

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
