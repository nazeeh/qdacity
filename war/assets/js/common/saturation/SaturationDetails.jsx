import 'script!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class SaturationDetails extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.initTable();
	}
	componentDidUpdate() {
		if (this.props.saturation) {
			this.initTable();
			this.drawDataTable();
		}
	}

	initTable() {
		var dataSet = [];
		var tableMount = $('#saturationTable');
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

	drawDataTable() {
		if (typeof this.props.saturation !== 'undefined') {
			var table = $('#saturationTable').DataTable();
			table.clear();

			var pr = this.props.saturation.saturationParameters;
			table.row.add(['Applied Codes', this.toPercent(this.props.saturation.applyCodeSaturation), this.toPercent(pr.appliedCodesChangeWeight)]);
			table.row.add(['Deleted Code Relationships', this.toPercent(this.props.saturation.deleteCodeRelationShipSaturation), this.toPercent(pr.deleteCodeRelationShipChangeWeight)]);
			table.row.add(['Deleted Codes', this.toPercent(this.props.saturation.deleteCodeSaturation), this.toPercent(pr.deleteCodeChangeWeight)]);
			table.row.add(['New Documents', this.toPercent(this.props.saturation.documentSaturation), this.toPercent(pr.insertDocumentChangeWeight)]);
			table.row.add(['New Code Relationships', this.toPercent(this.props.saturation.insertCodeRelationShipSaturation), this.toPercent(pr.insertCodeRelationShipChangeWeight)]);
			table.row.add(['New Codes', this.toPercent(this.props.saturation.insertCodeSaturation), this.toPercent(pr.insertCodeChangeWeight)]);
			table.row.add(['Relocated Codes', this.toPercent(this.props.saturation.relocateCodeSaturation), this.toPercent(pr.relocateCodeChangeWeight)]);
			table.row.add(['Code Author Changes', this.toPercent(this.props.saturation.updateCodeAuthorSaturation), this.toPercent(pr.updateCodeAuthorChangeWeight)]);
			table.row.add(['CodeBookEntry Definition Changes', this.toPercent(this.props.saturation.updateCodeBookEntryDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryDefinitionChangeWeight)]);
			table.row.add(['CodeBookEntry Example Changes', this.toPercent(this.props.saturation.updateCodeBookEntryExampleSaturation), this.toPercent(pr.updateCodeBookEntryExampleChangeWeight)]);
			table.row.add(['CodeBookEntry Short Definition Changes', this.toPercent(this.props.saturation.updateCodeBookEntryShortDefinitionSaturation), this.toPercent(pr.updateCodeBookEntryShortDefinitionChangeWeight)]);
			table.row.add(['CodeBookEntry When Not To Use Changes', this.toPercent(this.props.saturation.updateCodeBookEntryWhenNotToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenNotToUseChangeWeight)]);
			table.row.add(['CodeBookEntry When To Use Changes', this.toPercent(this.props.saturation.updateCodeBookEntryWhenToUseSaturation), this.toPercent(pr.updateCodeBookEntryWhenToUseChangeWeight)]);
			table.row.add(['Code Color Changes', this.toPercent(this.props.saturation.updateCodeColorSaturation), this.toPercent(pr.updateCodeColorChangeWeight)]);
			//we skip id changes here!
			table.row.add(['Code Memo Changes', this.toPercent(this.props.saturation.updateCodeMemoSaturation), this.toPercent(pr.updateCodeMemoChangeWeight)]);
			table.row.add(['Code Name Changes', this.toPercent(this.props.saturation.updateCodeNameSaturation), this.toPercent(pr.updateCodeNameChangeWeight)]);

			table.draw();
		}
	}

	toPercent(value) {
		return (value * 100).toFixed(2) + "%";
	}

	render() {
		if (!this.props.saturation) return null;
		return (<div>
            <p>Last calculation of saturation is from: {this.props.saturation.evalStartDate} to {this.props.saturation.creationTime}</p>
            <table id="saturationTable" className="display">
        
            </table>
            <p>Parameters used from : {this.props.saturation.saturationParameters.creationTime}</p>
        </div>);
	}

}