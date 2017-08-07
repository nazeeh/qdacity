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

            var saturationNameAndWeightsAndSaturation = new SaturationWeights(this.props.saturation.saturationParameters).getNameAndWeightsAndSaturationArray(this.props.saturation);

            for (var i in saturationNameAndWeightsAndSaturation) {
                if(saturationNameAndWeightsAndSaturation[i][1] > 0) { //only show if weighted.
                    table.row.add([saturationNameAndWeightsAndSaturation[i][0], this.toPercent(saturationNameAndWeightsAndSaturation[i][3]), this.toPercent(saturationNameAndWeightsAndSaturation[i][1]), this.toPercent(saturationNameAndWeightsAndSaturation[i][2])]);
                }
            }
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