<?php
// Habilitar el reporte de errores de PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Configurar la conexión a la base de datos MySQL
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "asg";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión: " . $conn->connect_error]));
}

// Parámetros enviados por jqGrid (AJAX)
$page = isset($_POST['page']) ? intval($_POST['page']) : 1;
$limit = isset($_POST['rows']) ? intval($_POST['rows']) : 10;
$sidx = isset($_POST['sidx']) ? $_POST['sidx'] : 'codigo_alarma';
$sord = isset($_POST['sord']) ? $_POST['sord'] : 'asc';

// Consulta básica para seleccionar las alarmas
$sql = "SELECT codigo_alarma, id_tag, idSensor, type, tiempo, tiempo_ultima_activacion 
        FROM alarmas 
        WHERE (activa = 1 OR (activa = 0 AND ack = 0))";

// Agregar ordenación
$sql .= " ORDER BY $sidx $sord";

// Agregar paginación
$sql .= " LIMIT " . (($page - 1) * $limit) . ", $limit";

// Ejecutar la consulta
$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "Error en la consulta: " . $conn->error]));
}

// Contar el número total de registros sin ningún filtro
$totalSql = "SELECT COUNT(*) as total FROM alarmas";
$totalResult = $conn->query($totalSql);
$totalRow = $totalResult->fetch_assoc();
$recordsTotal = $totalRow['total'];

// Contar el número de registros filtrados
$filteredSql = "SELECT COUNT(*) as total 
                FROM alarmas 
                WHERE (activa = 1 OR (activa = 0 AND ack = 0))";

$filteredResult = $conn->query($filteredSql);
$filteredRow = $filteredResult->fetch_assoc();
$recordsFiltered = $filteredRow['total'];

// Arreglo para almacenar los datos
$data = [];

// Extraer los datos de las alarmas
while ($row = $result ->fetch_assoc()) {
    $data[] = [
        'codigo_alarma' => $row['codigo_alarma'],
        'id_tag' => $row['id_tag'],
        'idSensor' => $row['idSensor'],
        'type' => $row['type'],
        'tiempo' => $row['tiempo'],
        'tiempo_ultima_activacion' => $row['tiempo_ultima_activacion']
    ];
}

// Cerrar la conexión
$conn->close();

// Devolver los datos en formato JSON
echo json_encode([
    'page' => $page,
    'total' => ceil($recordsTotal / $limit),
    'records' => $recordsTotal,
    'rows' => $data
]);
?>