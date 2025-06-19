<?php
// Iniciar buffer para evitar salidas no deseadas
ob_start();

// Ajustes de desarrollo (comentar en producción)
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

try {
    // 1) Validar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 2) Validar sesión/tab_id
    $tab_id = $_GET['tab_id'] ?? '';
    if (
        empty($tab_id)
        || !isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])
    ) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 2b) Obtener IdUsuario
    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (!$stmtUser) {
        throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    }
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (!$stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    // 3) Validar campos generales
    $campos = [
        'Responsable','NumeroParte','Cantidad',
        'IdTerceria','IdCommodity','IdProveedor'
    ];
    foreach ($campos as $c) {
        if (!isset($_POST[$c]) || trim($_POST[$c]) === '') {
            throw new Exception("Falta el campo $c");
        }
    }

    // 4) Recoger datos
    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad    = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = trim($_POST['Descripcion'] ?? '');
    $idTerceria  = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus     = 1;

    // 5) Insertar caso
    $con = (new LocalConector())->conectar();
    $sql = "
        INSERT INTO Casos
            (IdUsuario, NumeroParte, Cantidad, Descripcion,
             IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $stmt = $con->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    }
    $stmt->bind_param(
        "isdsiiiis",
        $idUsuario,
        $numeroParte,
        $cantidad,
        $descripcion,
        $idTerceria,
        $idCommodity,
        $idProveedor,
        $estatus,
        $responsable
    );
    if (!$stmt->execute()) {
        throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    }
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 6) Preparar carpetas
    $baseDir = __DIR__ . '/uploads';
    $okDir   = "$baseDir/ok";
    $noDir   = "$baseDir/no";
    foreach ([$okDir, $noDir] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // 7) Validar y procesar defectos
    if (!isset($_POST['defectos']) || !is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos.');
    }
    foreach ($_POST['defectos'] as $index => $bloque) {
        $idDefecto = intval($bloque['idDefecto'] ?? 0);
        if ($idDefecto <= 0) {
            throw new Exception("Defecto inválido en el bloque " . ($index + 1));
        }

        // Insertar en DefectosCaso
        $stmtDef = $con->prepare("
            INSERT INTO DefectosCaso (FolioCaso, IdDefectos)
            VALUES (?, ?)
        ");
        $stmtDef->bind_param("ii", $folioCaso, $idDefecto);
        if (!$stmtDef->execute()) {
            throw new Exception('Error insertando DefectosCaso: ' . $stmtDef->error);
        }
        $idDefectoCaso = $stmtDef->insert_id;
        $stmtDef->close();

        // Subir foto OK
        subirFotoDefecto(
            $_FILES['defectos']['name'][$index]['fotoOk']   ?? '',
            $_FILES['defectos']['tmp_name'][$index]['fotoOk'] ?? '',
            'ok',
            $folioCaso,
            $idDefectoCaso,
            $okDir,
            $con
        );
        // Subir foto NO OK
        subirFotoDefecto(
            $_FILES['defectos']['name'][$index]['fotoNo']    ?? '',
            $_FILES['defectos']['tmp_name'][$index]['fotoNo'] ?? '',
            'no',
            $folioCaso,
            $idDefectoCaso,
            $noDir,
            $con
        );
    }

    // 8) Función para procesar subida de foto
    function subirFotoDefecto($nombre, $tmp, $tipo, $folio, $idDefectoCaso, $destDir, $con) {
        if (empty($tmp) || empty($nombre)) return;
        $nombreSeguro = basename($nombre);
        $final        = uniqid() . "_{$nombreSeguro}";
        $rutaFull     = "$destDir/$final";
        if (!move_uploaded_file($tmp, $rutaFull)) {
            throw new Exception("No se pudo subir la foto $tipo.");
        }
        $ins = $con->prepare("
            INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta)
            VALUES (?, ?, ?, ?)
        ");
        $ins->bind_param("iiss", $folio, $idDefectoCaso, $tipo, $final);
        if (!$ins->execute()) {
            throw new Exception('Error insertando Foto: ' . $ins->error);
        }
        $ins->close();
    }

    // 9) Lookup de textos
    function lookup(mysqli $c, string $table, string $idField, string $nameField, int $id) {
        $st = $c->prepare("SELECT `$nameField` FROM `$table` WHERE `$idField` = ?");
        $st->bind_param("i", $id);
        $st->execute();
        $st->bind_result($val);
        $st->fetch();
        $st->close();
        return $val;
    }
    $estatusText   = lookup($con, 'Estatus',  'IdEstatus',   'NombreEstatus',   $estatus);
    $terciariaText = lookup($con, 'Terceria', 'IdTerceria',  'NombreTerceria',  $idTerceria);

    // 10) Limpiar buffer y devolver JSON
    ob_clean();
    echo json_encode([
        'status'      => 'success',
        'message'     => "Caso #{$folioCaso} guardado correctamente.",
        'folio'       => $folioCaso,
        'fecha'       => date('Y-m-d'),
        'estatus'     => $estatusText,
        'responsable' => $responsable,
        'terciaria'   => $terciariaText
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
