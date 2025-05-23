<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

// Incluimos la clase de conexión
include_once 'conexionContencion.php';

try {
    // 1) Método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 2) Recuperar tab_id y username de la sesión
    $tab_id = $_GET['tab_id'] ?? '';
    if (
        empty($tab_id) ||
        ! isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])
    ) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 2b) Obtener IdUsuario real de la tabla Usuario
    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (! $stmtUser) {
        throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    }
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (! $stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    // 3) Validar campos obligatorios
    $campos = [
        'Responsable','NumeroParte','Cantidad',
        'IdTerceria','IdCommodity','IdProveedor','IdDefectos'
    ];
    foreach ($campos as $c) {
        if (! isset($_POST[$c]) || trim($_POST[$c]) === '') {
            throw new Exception("Falta el campo $c");
        }
    }

    // 4) Recoger datos del formulario
    $responsable  = trim($_POST['Responsable']);
    $numeroParte  = trim($_POST['NumeroParte']);
    $cantidad     = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion  = trim($_POST['Descripcion'] ?? '');
    $idTerceria   = intval($_POST['IdTerceria']);
    $idCommodity  = intval($_POST['IdCommodity']);
    $idProveedor  = intval($_POST['IdProveedor']);
    $idDefectos   = intval($_POST['IdDefectos']);

    // 5) Conectar a la BD para insertar el caso
    $con = (new LocalConector())->conectar();

    // 6) Insertar el nuevo caso
    $sql = "
      INSERT INTO Casos
        (IdUsuario, NumeroParte, Cantidad, Descripcion, IdTerceria, IdCommodity, IdProveedor, IdDefectos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $stmt = $con->prepare($sql);
    if (! $stmt) {
        throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    }
    $stmt->bind_param(
        "isdsiiii",
        $idUsuario,
        $numeroParte,
        $cantidad,
        $descripcion,
        $idTerceria,
        $idCommodity,
        $idProveedor,
        $idDefectos
    );
    if (! $stmt->execute()) {
        throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    }
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 7) Preparar carpetas de subida
    $baseDir = __DIR__ . '/uploads';
    $okDir   = "$baseDir/ok";
    $noDir   = "$baseDir/no";
    foreach ([$okDir, $noDir] as $dir) {
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // 7b) Validar número máximo de archivos por tipo
    $numOk = isset($_FILES['fotosOk']['name'])
        ? count(array_filter($_FILES['fotosOk']['name']))
        : 0;
    $numNo = isset($_FILES['fotosNo']['name'])
        ? count(array_filter($_FILES['fotosNo']['name']))
        : 0;
    if ($numOk > 5) {
        throw new Exception("No puedes subir más de 5 fotos OK.");
    }
    if ($numNo > 5) {
        throw new Exception("No puedes subir más de 5 fotos NO OK.");
    }

    // 8) Función helper para procesar fotos
    function procesarFotos(array $filesArray, string $tipo, int $folio, $con, string $destDir) {
        if (
            empty($filesArray['name']) ||
            ! is_array($filesArray['name'])
        ) {
            return;
        }
        $count = count($filesArray['name']);
        for ($i = 0; $i < $count; $i++) {
            if (empty($filesArray['tmp_name'][$i])) {
                continue;
            }
            $origName = basename($filesArray['name'][$i]);
            $newName  = uniqid() . "_{$origName}";
            $destPath = "$destDir/$newName";

            if (! move_uploaded_file($filesArray['tmp_name'][$i], $destPath)) {
                throw new Exception("No se pudo mover foto ($tipo): $origName");
            }

            $ins = $con->prepare("
              INSERT INTO Fotos (FolioCaso, TipoFoto, Ruta)
              VALUES (?, ?, ?)
            ");
            if (! $ins) {
                throw new Exception('Error preparando INSERT Fotos: ' . $con->error);
            }
            $ins->bind_param("iss", $folio, $tipo, $newName);
            if (! $ins->execute()) {
                throw new Exception('Error ejecutando INSERT Fotos: ' . $ins->error);
            }
            $ins->close();
        }
    }

    // 9) Procesar todas las fotos OK y NO OK
    procesarFotos($_FILES['fotosOk']  ?? ['name'=>[]], 'ok', $folioCaso, $con, $okDir);
    procesarFotos($_FILES['fotosNo']  ?? ['name'=>[]], 'no', $folioCaso, $con, $noDir);

    // 10) Responder éxito
    echo json_encode([
        'status'  => 'success',
        'message' => "Caso #{$folioCaso} guardado correctamente."
    ]);
    exit;

} catch (Exception $e) {
    // En caso de error
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
