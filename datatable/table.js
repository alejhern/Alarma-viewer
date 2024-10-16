$(document).ready(function () {
    // Inicializar DataTable
    var table = $("#alarmasTable").DataTable({
        processing: true,
        serverSide: true,
        stateSave: false, // Desactiva el guardado automático del estado
        ajax: {
            url: "./api.php",
            type: "POST",
            dataSrc: function (json) {
                if (json.error) {
                    alert(json.error);
                    return [];
                }
                return json.data; // Retornar los datos que se llenarán en la tabla
            },
        },
        lengthMenu: [10, 25, 50, 100], // Control de "Show entries"
        pageLength: 10, // Valor inicial para mostrar
        colReorder: {
            fixedColumnsLeft: 1,
            fixedColumnsRight: 1,
            order: [1, 2, 3, 4, 5, 6] // Ajusta esto según el número total de columnas
        }, // Permite reordenar columnas
        columns: [
            { 
                data: null
                , orderable: false
                , render: function (data, type, rowObject)
                {
                    return '<input type="checkbox" class="select-checkbox" value="' + rowObject.codigo_alarma + '">';
                }
            },
            { data: "codigo_alarma" },
            { data: "id_tag" },
            { data: "idSensor" },
            { data: "type" },
            { data: "tiempo" },
            { data: "tiempo_ultima_activacion" },
            {
                data: null
                , orderable: false
                , render: function (data, type, rowObject)
                {
                    return (
                        '<button class="btn-icon btn-icon-check-double" title="ACK" data-id="' +
                        rowObject.codigo_alarma +
                        '"><i class="fas fa-check-double"></i></button> '
                    ); 
                }
            }
        ],
        dom: 'lBfrtip', // l: length changing input control, B: buttons, f: filtering input, r: processing display element, t: the table, i: table information summary, p: pagination control
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> Exportar a Excel', // Botón con icono
                title: 'Alarmas',
                exportOptions: {
                    columns: ':visible:not(#selectAll-col):not(#actions-col)' // Excluir las columnas de checkboxes y acciones
                }
            },
            {
                extend: 'colvis',
                text: '<i class="fas fa-columns"></i> Mostrar/Ocultar Columnas', // Botón con icono
                columns: ':not(:last-child)' // Excluir la columna de acciones
            },
            {
                text: '<i class="fas fa-save"></i> Guardar Configuración', // Botón personalizado con icono
                action: function () {
                    var state = {
                        order: table.order(),
                        colReorder: table.colReorder.order()
                    };
                    localStorage.setItem('DataTables_alarmasTable', JSON.stringify(state)); // Guarda el estado manualmente
                    alert("¡Configuración guardada!");
                }
            }
        ]
    });

    // Añadir los botones al contenedor
    table.buttons().container().appendTo('#contenedor_buttons');

    // Filtros por columna
    $('#alarmasTable tfoot input').on('keyup change', function () {
        var columnIndex = $(this).parent().index(); // Obtener el índice de la columna
        table.column(columnIndex).search(this.value).draw(); // Filtrar por columna
    });

    // Restaurar el estado guardado
    var savedState = localStorage.getItem('DataTables_alarmasTable');
    if (savedState) {
        var parsedState = JSON.parse(savedState);
        // Verifica que el estado guardado tenga las propiedades esperadas
        if (parsedState.order && Array.isArray(parsedState.order)) {
            table.order(parsedState.order); // Reordena las columnas
        }
        if (parsedState.page !== undefined) {
            table.page(parsedState.page).draw(); // Cambia a la página guardada y redibuja
        }
        if (parsedState.colReorder && Array.isArray(parsedState.colReorder)) {
            table.colReorder.order(parsedState.colReorder); // Reordena las columnas
        }
    }

    $(".alarm-row").addClass("alarm-row-animated");

    // Seleccionar/desmarcar todos los checkboxes al hacer clic en el checkbox principal
    $(".selectAll").on("click", function () {
        var rows = $("#alarmasTable")
            .DataTable()
            .rows({ search: "applied" })
            .nodes();
        $('input[type="checkbox"]', rows).prop("checked", this.checked);
    });

    // Agregar funcionalidad a los botones de edición y eliminación
    $("#alarmasTable").on("click", ".btn-icon-edit", function () {
        var id = $(this).data("id");
        alert("Editando alarma con ID: " + id);
    });

    $("#alarmasTable").on("click", ".btn-icon-delete", function () {
        var id = $(this).data("id");
        if (confirm("¿Estás seguro de que deseas eliminar la alarma con ID: " + id + "?")) {
            // Lógica de eliminación
        }
    });
});