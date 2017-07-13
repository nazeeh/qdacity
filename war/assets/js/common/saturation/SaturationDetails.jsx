import 'script!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class SaturationDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {"sat": props.saturation};
    }

    componentDidMount() {
        this.initTable();
        this.drawDataTable();
    }
    componentDidUpdate() {
        this.drawDataTable();
    }

    initTable() {
        var dataSet = [];
        var tableMount = $('#saturationTable');
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

            var table = tableMount.dataTable({
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
    }

    drawDataTable() {
        if (typeof this.state.sat !== 'undefined') {
            var table = $('#saturationTable').DataTable();
            table.clear();

            var pr = this.state.sat.saturationParameters;
            table.row.add(['Applied Codes', this.toPercent(this.state.sat.applyCodeSaturation), this.toPercent(pr.appliedCodesChangeWeight)]);
            table.row.add(['Deleted Code Relationships', this.toPercent(this.state.sat.deleteCodeRelationShipSaturation), this.toPercent(pr.deleteCodeRelationShipChangeWeight)]);
            table.row.add(['Deleted Codes', this.toPercent(this.state.sat.deleteCodeSaturation), this.toPercent(pr.deleteCodeChangeWeight)]);
            table.row.add(['New Documents', this.toPercent(this.state.sat.documentSaturation), this.toPercent(pr.insertDocumentChangeWeight)]);
            table.row.add(['New Code Relationships', this.toPercent(this.state.sat.insertCodeRelationShipSaturation), this.toPercent(pr.insertCodeRelationShipChangeWeight)]);
            table.row.add(['New Codes', this.toPercent(this.state.sat.insertCodeSaturation), this.toPercent(pr.insertCodeChangeWeight)]);
            table.row.add(['Relocated Codes', this.toPercent(this.state.sat.relocateCodeSaturation), this.toPercent(pr.relocateCodeChangeWeight)]);
            table.row.add(['Code Author Changes', this.toPercent(this.state.sat.updateCodeAuthorSaturation), this.toPercent(pr.updateCodeAuthorChangeWeight)]);
            table.row.add(['CodeBookEntry Definition Changes', this.toPercent(this.state.sat.updateCodeBookEntryDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryDefinitionChangeWeight)]);
            table.row.add(['CodeBookEntry Example Changes', this.toPercent(this.state.sat.updateCodeBookEntryExampleSaturation), this.toPercent(pr.updateCodeBookEntryExampleChangeWeight)]);
            table.row.add(['CodeBookEntry Short Definition Changes', this.toPercent(this.state.sat.updateCodeBookEntryShortDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryShortDefinitionChangeWeight)]);
            table.row.add(['CodeBookEntry When Not To Use Changes', this.toPercent(this.state.sat.updateCodeBookEntryWhenNotToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenNotToUseChangeWeight)]);
            table.row.add(['CodeBookEntry When To Use Changes', this.toPercent(this.state.sat.updateCodeBookEntryWhenToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenToUseChangeWeight)]);
            table.row.add(['Code Color Changes', this.toPercent(this.state.sat.updateCodeColorSaturation), this.toPercent(pr.updateCodeColorChangeWeight)]);
            //we skip id changes here!
            table.row.add(['Code Memo Changes', this.toPercent(this.state.sat.updateCodeMemoSaturation), this.toPercent(pr.updateCodeMemoChangeWeight)]);
            table.row.add(['Code Name Changes', this.toPercent(this.state.sat.updateCodeNameSaturation), this.toPercent(pr.updateCodeNameChangeWeight)]);

            table.draw();
        }
    }

    toPercent(value) {
        return (value * 100).toFixed(2) + "%";
    }

    render() {
        return(<div>
            <table id="saturationTable" className="display">
        
            </table>
        </div>);
    }

}