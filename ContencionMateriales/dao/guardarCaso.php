<?php
ob_start();
session_start();
header('Content-Type: application/json; charset=UTF-8');
include_once 'conexionContencion.php';

try {
    // 1) Verificar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 2) Validar sesión
    $tab_id = isset($_GET['tab_id']) ? $_GET['tab_id'] : '';
    if (empty($tab_id) || ! isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 2b) Obtener ID del usuario
    $conUser  = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (! $stmtUser) throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (! $stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    // 3) Validar campos obligatorios
    $required = ['Responsable','NumeroParte','Cantidad','IdTerceria','IdCommodity','IdProveedor'];
    foreach ($required as $f) {
        if (! isset($_POST[$f]) || trim($_POST[$f]) === '') {
            throw new Exception("Falta el campo $f");
        }
    }

    // 4) Obtener valores
    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad    = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = isset($_POST['Descripcion']) ? trim($_POST['Descripcion']) : '';
    $idTerceria  = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus     = 1;

    // 5) Insertar caso
    $con = (new LocalConector())->conectar();
    $stmt = $con->prepare("
      INSERT INTO Casos
        (IdUsuario, NumeroParte, Cantidad, Descripcion,
         IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    if (! $stmt) throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    $stmt->bind_param("isdsiiiis", $idUsuario, $numeroParte, $cantidad, $descripcion,
        $idTerceria, $idCommodity, $idProveedor, $estatus, $responsable);
    if (! $stmt->execute()) throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 6) Crear carpetas si no existen
    $baseDir = __DIR__ . '/uploads';
    foreach (['ok', 'no', 'pdf'] as $folder) {
        $dir = "$baseDir/$folder";
        if (! is_dir($dir)) mkdir($dir, 0755, true);
    }

    // 7) Insertar método de trabajo (si se envió)
    if (isset($_FILES['archivoPDF']) && $_FILES['archivoPDF']['error'] === UPLOAD_ERR_OK) {
        $archivoPDF = $_FILES['archivoPDF'];
        $nombrePDF  = basename($archivoPDF['name']);
        $nombrePDF  = uniqid() . "_" . preg_replace('/\s+/', '_', $nombrePDF);
        $destino    = "$baseDir/pdf/$nombrePDF";

        if (!move_uploaded_file($archivoPDF['tmp_name'], $destino)) {
            throw new Exception('No se pudo subir el archivo PDF.');
        }

        // Insertar en MetodoTrabajo
        $stmtPDF = $con->prepare("
            INSERT INTO MetodoTrabajo (FolioCaso, RutaPDF, SubidoPor, Correo)
            VALUES (?, ?, 'usuario', ?)
        ");
        $stmtPDF->bind_param("iss", $folioCaso, $nombrePDF, $username);
        if (! $stmtPDF->execute()) {
            throw new Exception('Error insertando método de trabajo: ' . $stmtPDF->error);
        }
        $stmtPDF->close();
    }

    // 8) Procesar defectos
    if (! isset($_POST['defectos']) || ! is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos.');
    }

    foreach ($_POST['defectos'] as $idx => $bloque) {
        $idDef = intval($bloque['idDefecto'] ?? 0);
        if ($idDef <= 0) {
            throw new Exception("Defecto inválido en bloque " . ($idx + 1));
        }

        // Insertar defecto
        $sd = $con->prepare("INSERT INTO DefectosCaso (FolioCaso, IdDefectos) VALUES (?,?)");
        $sd->bind_param("ii", $folioCaso, $idDef);
        if (! $sd->execute()) {
            throw new Exception('Error insertando DefectosCaso: ' . $sd->error);
        }
        $idDefCaso = $sd->insert_id;
        $sd->close();

        // Subir fotos
        subirFoto($idx, 'fotoOk', 'ok', $folioCaso, $idDefCaso, "$baseDir/ok", $con);
        subirFoto($idx, 'fotoNo',  'no', $folioCaso, $idDefCaso, "$baseDir/no", $con);
    }

    // 9) Respuesta final
    ob_clean();
    echo json_encode([
        'status'      => 'success',
        'message'     => "Caso #{$folioCaso} guardado correctamente.",
        'folio'       => $folioCaso,
        'fecha'       => date('Y-m-d'),
        'estatus'     => lookup($con, 'Estatus',  'IdEstatus',   'NombreEstatus',   $estatus),
        'responsable' => $responsable,
        'terciaria'   => lookup($con, 'Terceria', 'IdTerceria',  'NombreTerceria',  $idTerceria)
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

// Subir una foto OK o NO OK
function subirFoto($idx, $campo, $tipo, $folio, $idDefCaso, $dir, $con) {
    if (! isset($_FILES['defectos']['tmp_name'][$idx][$campo]) ||
        $_FILES['defectos']['error'][$idx][$campo] !== UPLOAD_ERR_OK) {
        return;
    }
    $orig = basename($_FILES['defectos']['name'][$idx][$campo]);
    $new  = uniqid() . "_{$orig}";
    if (! move_uploaded_file($_FILES['defectos']['tmp_name'][$idx][$campo], "$dir/$new")) {
        throw new Exception("No se pudo subir la foto $tipo.");
    }
    $i = $con->prepare(
        "INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta)
         VALUES (?, ?, ?, ?)"
    );
    $i->bind_param("iiss", $folio, $idDefCaso, $tipo, $new);
    if (! $i->execute()) {
        throw new Exception('Error insertando Foto: ' . $i->error);
    }
    $i->close();
}

// Consulta auxiliar
function lookup($con, $tabla, $idFld, $nameFld, $val) {
    $output = '';
    $st = $con->prepare("SELECT `$nameFld` FROM `$tabla` WHERE `$idFld` = ?");
    if ($st) {
        $st->bind_param("i", $val);
        $st->execute();
        $st->bind_result($output);
        $st->fetch();
        $st->close();
    }
    return $output;
}
