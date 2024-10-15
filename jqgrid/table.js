$(document).ready(function () {
    $("#alarmasTable").jqGrid({
        url: "api.php",
        datatype: "json",
        mtype: "POST",
        colNames: [
            "Alarma", "Tag", "Sensor", "Type", "Tiempo", "Última Activación", "Acciones"
        ],
        colModel: [
            { name: "codigo_alarma", index: "codigo_alarma", width: 150, sortable: true },
            { name: "id_tag", index: "id_tag", width: 150, sortable: true },
            { name: "idSensor", index: "idSensor", width: 150, sortable: true },
            { name: "type", index: "type", width: 150, sortable: true },
            { name: "tiempo", index: "tiempo", width: 150, sortable: true },
            { name: "tiempo_ultima_activacion", index: "tiempo_ultima_activacion", width: 150, sortable: true },
            {
                name: "actions",
                index: "actions",
                width: 100,
                sortable: false,
                formatter: function (cellvalue, options, rowObject) {
                    return (
                        '<button class="btn-icon btn-icon-edit" data-id="' +
                        rowObject.codigo_alarma +
                        '"><i class="fas fa-edit"></i></button> ' +
                        '<button class="btn-icon btn-icon-delete" data-id="' +
                        rowObject.codigo_alarma +
                        '"><i class="fas fa-trash"></i></button>'
                    );
                },
            }
        ],
        rowNum: 10,
        rowList: [10, 25, 50, 100],
        pager: "#pager",
        sortname: "codigo_alarma",
        sortorder: "asc",
        viewrecords: true,
        caption: "Alarmas",
        height: "100%",
        autowidth: true,
    });
    

    $("#alarmasTable").jqGrid("filterToolbar", {
        stringResult: true,
        searchOnEnter: false,
    });

    $("#alarmasTable").jqGrid("navButtonAdd", "#pager", {
        caption: "",
        buttonicon: "fa-file-excel",
        onClickButton: function () {
            var grid = $("#alarmasTable");
            var rowIds = grid.jqGrid("getDataIDs");
            var rowDatas = [];
            for (var i = 0; i < rowIds.length; i++) {
                rowDatas.push(grid.jqGrid("getRowData", rowIds[i]));
            }
            var csv = "";
            for (var i = 0; i < rowDatas.length; i++) {
                csv += rowDatas[i].join(";") + "\n";
            }
            var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "alarmas.csv";
            link.click();
        },
    });
    
});
