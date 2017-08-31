import VexModal from '../modals/VexModal';

import 'script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class SaturationCategoryDetail extends VexModal {
	constructor(saturationCategory, category) {
		super();
		this.formElements = '<div id="saturationCategoryDetail" style="text-align: center; background-color: #eee; font-color:#222;"><table cellpadding="0" cellspacing="0" border="0" class="display" id="saturationCategoryDetailTable"></table></div>';
		this.modalHeader = category;
		this.saturationCategory = saturationCategory;
	}
	showModal() {
		var _this = this;
		vex.dialog.open({
			message: "Saturation Details for " + _this.modalHeader,
			contentCSS: {
				width: '900px'
			},
			input: _this.formElements,
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: 'OK'
				})
			]
		});
		this.setupDataTable();
	}

	setupDataTable() {
		var dataSet = [];

		var columnsArray = [];
		var columnLabelsArray = ['Change Category', 'Saturation', 'Weight (Importance)', 'Configured Maximum'];
		var width = 100 / (columnLabelsArray.length);
		for (var col in columnLabelsArray) {
			columnsArray = columnsArray.concat([{
				"title": columnLabelsArray[col],
				"width": "" + width + "%"
			}]);

		}

		if (!$.fn.dataTable.isDataTable('#saturationCategoryDetailTable')) {
			var table1 = $('#saturationCategoryDetailTable').dataTable({
				"iDisplayLength": 15,
				"bLengthChange": false,
				"data": dataSet,
				"autoWidth": false,
				"columns": columnsArray

			});
		}

		var table = $('#saturationCategoryDetailTable').DataTable();

		table.clear();

		for (var i in this.saturationCategory) {
			table.row.add([this.saturationCategory[i][0], this.toPercent(this.saturationCategory[i][1]), this.toPercent(this.saturationCategory[i][2]), this.toPercent(this.saturationCategory[i][3])]);
		}
		table.draw();
	}

	toPercent(value) {
		return (value * 100).toFixed(2) + "%";
	}
}