import VexModal from './VexModal';
import IntlProvider from '../Localization/LocalizationProvider';

import 'script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class IntercoderAgreementByCode extends VexModal {
	constructor(reportDetailHead, results) {
		super();
		this.formElements =
			'<div id="intercoderAgreementByCode" style="text-align: center; background-color: #eee; font-color:#222;"><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementByCodeTable"></table></div>';

		this.reportDetailHead = reportDetailHead;
		this.results = results;
	}
	showModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		vex.dialog.open({
			message: formatMessage({
				id: 'intercoderagreementbycode.agreement_by_code',
				defaultMessage: 'Agreement By Code'
			}),
			contentCSS: {
				width: '900px'
			},
			input: _this.formElements,
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({ id: 'modal.ok', defaultMessage: 'OK' })
				})
			]
		});
		this.setupDataTable();
	}

	setupDataTable() {
		var dataSet = [];
		if (!$.fn.dataTable.isDataTable('#agreementByCodeTable')) {
			var table1 = $('#agreementByCodeTable').dataTable({
				iDisplayLength: 15,
				bLengthChange: false,
				data: dataSet,
				autoWidth: false,
				columnDefs: [
					{
						width: '50%'
					},
					{
						width: '50%'
					}
				],
				columns: [
					{
						title: 'Code',
						width: '50%'
					},
					{
						title: 'Average Agreement',
						width: '50%'
					}
				]
			});
		}

		var table = $('#agreementByCodeTable').DataTable();

		table.clear();

		var codes = this.reportDetailHead.split(',');

		for (var i = 1; i < codes.length; i++) {
			var code = codes[i];

			var sum = 0;
			for (var r = 0; r < this.results.length; r++) {
				var result = this.results[r].reportRow.split(',');
				var resultNumber = parseFloat(result[i]);
				sum += resultNumber;
			}
			var average = sum / this.results.length;

			var row = [code, average];
			table.row.add(row);
		}
		table.draw();
	}
}
