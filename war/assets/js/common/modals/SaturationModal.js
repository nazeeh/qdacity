import ReactLoading from '../ReactLoading.jsx';
import VexModal from './VexModal';
import 'script!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class SaturationModal extends VexModal {

    constructor(projectId) {
        super();
        this.formElements = '';
        this.projectId = projectId;
        this.results;
        this.formElements += '<div id="saturation" style="text-align: center; background-color: #eee; font-color:#222; overflow:hidden; overflow-x: scroll;"><div id="saturationMetaData"></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="saturationTable"></table><div id="saturationChart"></div><div id="loadingAnimation" class="centerParent"><div id="reactLoading" class="centerChild"></div></div></div>';
    }

    showModal() {

        var _this = this;
        var promise = new Promise(
                function (resolve, reject) {

                    var formElements = _this.formElements;
                    var buttonArray = [$.extend({}, vex.dialog.buttons.YES, {
                            text: 'OK'
                        })];
                    vex.dialog.open({
                        message: "Saturation",
                        contentCSS: {
                            width: '900px'
                        },
                        input: formElements,
                        buttons: buttonArray,
                        callback: function (data) {

                            if (data != false) {
                                resolve(data);
                            } else
                                reject(data);
                        }
                    });
                    ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoading'));
                    gapi.client.qdacity.saturation.getHistoricalSaturationResults({
                        'projectId': _this.projectId
                    }).execute(function (resp) {
                        if (!resp.code) {
                            $('#loadingAnimation').addClass('hidden');
                            _this.results = resp.items || [];
                            _this.showDetails();
                        } else {
                            // Log error
                        }
                    });
                }
        );
        return promise;
    }

    showDetails() {

        this.setupDataTable();
        var mostRecentSaturation = this.getMostRecentSaturation();
        var saturationOverviewhtml = '';
        saturationOverviewhtml += '<p>Last calculation of saturation is from: ' + mostRecentSaturation.evaluationStartDate + ' to ' + mostRecentSaturation.creationTime + '</p>';
        saturationOverviewhtml += '<p>Parameters used from : ' + mostRecentSaturation.saturationParameters.creationTime + '</p>';
        saturationOverviewhtml += '<p>Diagram of historical developement</p>';
        $('#saturationMetaData').html(saturationOverviewhtml);

        this.drawDiagram();
    }

    drawDiagram() {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'X');
        data.addColumn('number', 'Applied Codes');
        data.addColumn('number', 'Deleted Code Relationships');
        data.addColumn('number', 'Deleted Codes');
        data.addColumn('number', 'New Documents');
        data.addColumn('number', 'New Code Relationships');
        data.addColumn('number', 'New Codes');
        data.addColumn('number', 'Relocated Codes');
        data.addColumn('number', 'Code Author Changes');
        data.addColumn('number', 'CodeBookEntry Definition Changes');
        data.addColumn('number', 'CodeBookEntry Exaple Changes');
        data.addColumn('number', 'CodeBookEntry Short Definition Changes');
        data.addColumn('number', 'CodeBookEntry When Not To Use Changes');
        data.addColumn('number', 'CodeBookEntry When To Use Changes');
        data.addColumn('number', 'Code Color Changes');
        data.addColumn('number', 'Code Memo Changes');
        data.addColumn('number', 'Code Name Changes');
        //TODO average

        var rows = [];
        for (var i in this.results) {
            var sat = this.results[i];
            var oneDataSet = [new Date(sat.creationTime),
                sat.applyCodeSaturation,
                sat.deleteCodeRelationShipSaturation,
                sat.deleteCodeSaturation,
                sat.documentSaturation,
                sat.insertCodeRelationShipSaturation,
                sat.insertCodeSaturation,
                sat.relocateCodeSaturation,
                sat.updateCodeAuthorSaturation,
                sat.updateCodeBookEntryDefinitionSaturation,
                sat.updateCodeBookEntryExampleSaturation,
                sat.updateCodeBookEntryShortDefinitionSaturation,
                sat.updateCodeBookEntryWhenNotToUseSaturation,
                sat.updateCodeBookEntryWhenToUseSaturation,
                sat.updateCodeColorSaturation,
                sat.updateCodeMemoSaturation,
                sat.updateCodeNameSaturation,
            ];
            //TODO average (and focus on average when opening diagram)
            rows.push(oneDataSet);
        }
        data.addRows(rows);

        var options = {
            hAxis: {
                title: 'Time'
            },
            vAxis: {
                title: 'Saturation in percent'
            },
            series: {
                1: {curveType: 'function'}
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('saturationChart'));
        chart.draw(data, options);
    }

    getMostRecentSaturation() {
        if (this.results.length > 0) {
            var mostRecenResult = this.results[0];
            for (var i in this.results) {
                var myDate = new Date(mostRecenResult.creationTime);
                var otherDate = new Date(this.results[i].creationTime);
                if (myDate < otherDate) {
                    mostRecenResult = this.results[i];
                }
            }
            return mostRecenResult;
        } else {
            return null;
        }
    }

    setupDataTable() {
        var dataSet = [];
        // initialize if not initialized
        if (!$.fn.dataTable.isDataTable('#saturationTable')) {
            var columnsArray = [];
            var columnLabelsArray = ['Change Type', 'Saturation', 'Weight (Importance)'];
            var width = 100 / columnLabelsArray.length;
            for (var col in columnLabelsArray) {
                columnsArray = columnsArray.concat([{
                        "title": columnLabelsArray[col],
                        "width": "" + width + "%"
                    }]);
            }

            var table1 = $('#saturationTable').dataTable({
                "iDisplayLength": 6,
                "bLengthChange": false,
                "data": dataSet,
                "autoWidth": false,
                "columns": columnsArray,
                "aaSorting": [
                    [1, 'asc'],
                    [2, 'desc']
                ]

            });
        }

        var table = $('#saturationTable').DataTable();
        table.clear();
        var mrSat = this.getMostRecentSaturation();
        var pr = mrSat.saturationParameters;
        table.row.add(['Applied Codes', this.toPercent(mrSat.applyCodeSaturation), this.toPercent(pr.appliedCodesChangeWeight)]);
        table.row.add(['Deleted Code Relationships', this.toPercent(mrSat.deleteCodeRelationShipSaturation), this.toPercent(pr.deleteCodeRelationShipChangeWeight)]);
        table.row.add(['Deleted Codes', this.toPercent(mrSat.deleteCodeSaturation), this.toPercent(pr.deleteCodeChangeWeight)]);
        table.row.add(['New Documents', this.toPercent(mrSat.documentSaturation), this.toPercent(pr.insertDocumentChangeWeight)]);
        table.row.add(['New Code Relationships', this.toPercent(mrSat.insertCodeRelationShipSaturation), this.toPercent(pr.insertCodeRelationShipChangeWeight)]);
        table.row.add(['New Codes', this.toPercent(mrSat.insertCodeSaturation), this.toPercent(pr.insertCodeChangeWeight)]);
        table.row.add(['Relocated Codes', this.toPercent(mrSat.relocateCodeSaturation), this.toPercent(pr.relocateCodeChangeWeight)]);
        table.row.add(['Code Author Changes', this.toPercent(mrSat.updateCodeAuthorSaturation), this.toPercent(pr.updateCodeAuthorChangeWeight)]);
        table.row.add(['CodeBookEntry Definition Changes', this.toPercent(mrSat.updateCodeBookEntryDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryDefinitionChangeWeight)]);
        table.row.add(['CodeBookEntry Example Changes', this.toPercent(mrSat.updateCodeBookEntryExampleSaturation), this.toPercent(pr.updateCodeBookEntryExampleChangeWeight)]);
        table.row.add(['CodeBookEntry Short Definition Changes', this.toPercent(mrSat.updateCodeBookEntryShortDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryShortDefinitionChangeWeight)]);
        table.row.add(['CodeBookEntry When Not To Use Changes', this.toPercent(mrSat.updateCodeBookEntryWhenNotToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenNotToUseChangeWeight)]);
        table.row.add(['CodeBookEntry When To Use Changes', this.toPercent(mrSat.updateCodeBookEntryWhenToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenToUseChangeWeight)]);
        table.row.add(['Code Color Changes', this.toPercent(mrSat.updateCodeColorSaturation), this.toPercent(pr.updateCodeColorChangeWeight)]);
        //we skip id changes here!
        table.row.add(['Code Memo Changes', this.toPercent(mrSat.updateCodeMemoSaturation), this.toPercent(pr.updateCodeMemoChangeWeight)]);
        table.row.add(['Code Name Changes', this.toPercent(mrSat.updateCodeNameSaturation), this.toPercent(pr.updateCodeNameChangeWeight)]);
        table.draw();
    }

    toPercent(value) {
        return (value * 100).toFixed(2) + "%";
    }
}