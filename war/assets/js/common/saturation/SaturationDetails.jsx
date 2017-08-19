import 'script!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import SaturationWeights from '../saturation/SaturationWeights'

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
		var columnLabelsArray = ['Change Type', 'Saturation', 'Weight (Importance)', 'Configured Maximum'];
		var width = 100 / (columnLabelsArray.length);
		for (var col in columnLabelsArray) {
			columnsArray = columnsArray.concat([{
				"title": columnLabelsArray[col],
				"width": "" + width + "%"
			}]);

		}
		columnsArray = columnsArray.concat([{
			"title": "Category", //Category column should be invisible
			"width": "0%",
			className: "hidden",
		}]);

		var table = tableMount.dataTable({
			"paging": false,
			"scrollY": "250px",
			"bLengthChange": false,
			"data": dataSet,
			"autoWidth": false,
			"columns": columnsArray,
			"aaSorting": [
				[4, 'asc'],
				[1, 'asc'],
				[2, 'desc']
			],
			//see: https://www.datatables.net/examples/advanced_init/row_grouping.html
			//https://datatables.net/reference/option/drawCallback
                        
                        //TODO use averageForCategory from SaturationAverage and show only categories
                        
			"drawCallback": function (settings) {
				var api = this.api();
				var rows = api.rows({
					page: 'current'
				}).nodes();
				var last = null;

				api.column(4, {
					page: 'current'
				}).data().each(function (group, i) {
					if (last !== group) {
						$(rows).eq(i).before(
							'<tr class="group"><td colspan="5">' + group + '</td></tr>'
						);

						last = group;
					}
				});
			}
		});
	}

	drawDataTable() {
		if (typeof this.props.saturation !== 'undefined') {
			var table = $('#saturationTable').DataTable();
			table.clear();

			var saturationWeights = new SaturationWeights(this.props.saturation.saturationParameters);
			var saturationNameAndWeightsAndSaturation = saturationWeights.getNameAndWeightsAndSaturationArray(this.props.saturation);

			for (var i in saturationNameAndWeightsAndSaturation) {
				if (saturationNameAndWeightsAndSaturation[i][1] > 0) { //only show if weighted.
					table.row.add([saturationNameAndWeightsAndSaturation[i][0], this.toPercent(saturationNameAndWeightsAndSaturation[i][3]), this.toPercent(saturationNameAndWeightsAndSaturation[i][1]), this.toPercent(saturationNameAndWeightsAndSaturation[i][2]), saturationWeights.getCategoryForIndex(i)]);
				}
			}
			table.draw();

		}
	}

	toPercent(value) {
		return (value * 100).toFixed(2) + "%";
	}

	render() {
		if (!this.props.saturation)
			return null;
		return (<div>
            <p>Last calculation of saturation is from: {this.props.saturation.evalStartDate} to {this.props.saturation.creationTime}</p>
            <table id="saturationTable" className="display">
        
            </table>
            <p>Parameters used from : {this.props.saturation.saturationParameters.creationTime}</p>
        </div>);
	}

}