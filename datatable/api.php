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

// Parámetros enviados por DataTables (AJAX)
$start = isset($_POST['start']) ? intval($_POST['start']) : 0; // Índice de inicio
$length = isset($_POST['length']) ? intval($_POST['length']) : 100; // Cantidad de registros por página
$searchValue = isset($_POST['search']['value']) ? $_POST['search']['value'] : ''; // Valor de búsqueda
$orderColumn = isset($_POST['order'][0]['column']) ? intval($_POST['order'][0]['column']) : 0; // Columna de orden
$orderDir = isset($_POST['order'][0]['dir']) ? $_POST['order'][0]['dir'] : 'asc'; // Dirección de la ordenación

// Las columnas que tienes en tu tabla de la base de datos
$columns = ['codigo_alarma', 'id_tag', 'idSensor', 'type', 'tiempo', 'tiempo_ultima_activacion'];

// Validar si la columna de orden es válida
$orderColumn = isset($columns[$orderColumn]) ? $columns[$orderColumn] : $columns[0];

// Consulta básica para seleccionar las alarmas
$sql = "SELECT codigo_alarma, id_tag, idSensor, type, tiempo, tiempo_ultima_activacion 
        FROM alarmas 
        WHERE (activa = 1 OR (activa = 0 AND ack = 0))";

// Si hay un valor de búsqueda, agregar condición de filtrado
$searchValue = $conn->real_escape_string($searchValue);
if (!empty($searchValue)) {
    $sql .= " AND (codigo_alarma LIKE '%$searchValue%' 
              OR id_tag LIKE '%$searchValue%' 
              OR idSensor LIKE '%$searchValue%' 
              OR type LIKE '%$searchValue%' 
              OR tiempo LIKE '%$searchValue%' 
              OR tiempo_ultima_activacion LIKE '%$searchValue%')";
}

// Agregar ordenación
$sql .= " ORDER BY $orderColumn $orderDir";

// Agregar paginación
$sql .= " LIMIT $start, $length";

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

if (!empty($searchValue)) {
    $filteredSql .= " AND (codigo_alarma LIKE '%$searchValue%' 
                      OR id_tag LIKE '%$searchValue%' 
                      OR idSensor LIKE '%$searchValue%' 
                      OR type LIKE '%$searchValue%' 
                      OR tiempo LIKE '%$searchValue%' 
                      OR tiempo_ultima_activacion LIKE '%$searchValue%')";
}

$filteredResult = $conn->query($filteredSql);
$filteredRow = $filteredResult->fetch_assoc();
$recordsFiltered = $filteredRow['total'];

// Arreglo para almacenar los datos
$data = [];

// Extraer los datos de las alarmas
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Preparar la respuesta en JSON
$response = [
    "draw" => isset($_POST['draw']) ? intval($_POST['draw']) : 1,
    "recordsTotal" => $recordsTotal,
    "recordsFiltered" => $recordsFiltered,
    "data" => $data
];

// Verificar si la codificación JSON fue exitosa
$jsonResponse = json_encode($response);

if ($jsonResponse === false) {
    die(json_encode(["error" => "Error al codificar JSON: " . json_last_error_msg()]));
}

// // Guardar la respuesta JSON en un archivo
// $jsonFile = './alarmas.json'; // Nombre del archivo JSON
// file_put_contents($jsonFile, json_encode($response, JSON_PRETTY_PRINT)); 

// Enviar la respuesta como JSON
echo $jsonResponse;

// Cerrar la conexión
$conn->close();
?>
