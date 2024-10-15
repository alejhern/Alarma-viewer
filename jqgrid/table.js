$(document).ready(function () {
    $("#alarmasTable").jqGrid({
        url: "./api.php",
        datatype: "json",
        mtype: "POST",
        colNames: [
            "select All", "Alarma", "Tag", "Sensor", "Type", "Tiempo", "Última Activación", "Acciones"
        ],
        colModel: [
            {
                name: "select All",
                index: "select All",
                width: 100,
                sortable: false,
                formatter: function (cellvalue, options, rowObject) {
                    return (
                        '<input type="checkbox" class="select-checkbox" value="' + rowObject.codigo_alarma + '">'
                    );
                },
            },
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
                        '<button class="btn-icon btn-icon-check-double" title="ACK" data-id="' +
                        rowObject.codigo_alarma +
                        '"><i class="fas fa-check-double"></i></button> '
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
        height: "100%",
        autowidth: true,
    });

    $(".alarm-row").addClass("alarm-row-animated");

    function NewGrd_DelToolbar(aToolbar, aGrd) {
        var iToolbar = aToolbar;
        var iGrd = aGrd;
        if (iToolbar && iGrd) {
            var iObj = $("#" + iToolbar);
            var iHtml = "<div id=\"" + iToolbar + "\" class=\"btn-group_" + iGrd + "\" role=\"group\" aria-label=\"Toolbar_" + iToolbar + "\">";
            iHtml += "<button type=\"button\" id=\"btnExport_" + iGrd + "\" class=\"fa fa-download btn btn-secondary BntGrid\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"export csv\"></button>";
            iHtml += "<button type=\"button\" id=\"btnFilter_" + iGrd + "\" class=\"fa fa-filter btn btn-secondary BntGrid\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"filter data\"></button>";
            iHtml += "<button type=\"button\" id=\"btnColumns_" + iGrd + "\" class=\"fa fa-columns btn btn-secondary BntGrid\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"hide/show columns\"></button>";
            iHtml += "<button type=\"button\" id=\"btnRefresh_" + iGrd + "\" class=\"fa fa-refresh btn btn-secondary BntGrid\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"refresh data\"></button>";
            iHtml += "</div>";
            iObj.replaceWith(iHtml);
            iObj.data("grd", iGrd);

            // Filter button functionality
            $("#btnFilter_" + iGrd).on("click", function () {
                $(".ui-search-toolbar", $("#gbox_" + iGrd)).toggleClass("Invisible");
            });

            // Column chooser functionality
            $("#btnColumns_" + iGrd).on("click", function () {
                $("#" + iGrd).jqGrid("columnChooser", {
                    caption: "Show/Hide Columns",
                    bSubmit: "Submit",
                    bCancel: "Cancel",
                    done: function (perm) {
                        if (perm) {
                            this.jqGrid("remapColumns", perm, true);
                        }
                    }
                });
                return false;
            });

            // Export to CSV functionality
            $("#btnExport_" + iGrd).on("click", function () {
                var grid = $("#" + iGrd);
                var rowIds = grid.jqGrid("getDataIDs");
                var colModel = grid.jqGrid("getGridParam", "colModel");

                // Prepare CSV content
                var csvContent = "";

                // Add headers (excluding "select All" and "Acciones")
                var headers = colModel.filter(function (col) {
                    return col.name !== "select All" && col.name !== "actions";
                }).map(function (col) {
                    return '"' + (col.label || col.name) + '"';
                }).join(",") + "\n";
                csvContent += headers;

                // Add data rows
                for (var i = 0; i < rowIds.length; i++) {
                    var rowData = grid.jqGrid("getRowData", rowIds[i]);
                    var rowContent = colModel.filter(function (col) {
                        return col.name !== "select All" && col.name !== "actions";
                    }).map(function (col) {
                        return '"' + (rowData[col.name] || "") + '"';
                    }).join(",") + "\n";
                    csvContent += rowContent;
                }

                // Create and trigger download
                var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                var link = document.createElement("a");
                if (link.download !== undefined) {
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "Alarmas_" + new Date().toISOString() + ".csv"); // <--- Aquí puedes definir el nombre del archivo
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });

            // Refresh grid functionality
            $("#btnRefresh_" + iGrd).on("click", function () {
                $("#" + iGrd).trigger('reloadGrid');
            });

            return $("#" + iToolbar);
        }
    }

    // Añadir botones al toolbar
    NewGrd_DelToolbar("contenedor_buttons", "alarmasTable");


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
