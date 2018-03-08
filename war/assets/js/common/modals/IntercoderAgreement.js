import ReactDOM from 'react-dom';
import React from 'react';
import ReactLoading from '../ReactLoading.jsx';

import VexModal from './VexModal';
import IntercoderAgreementByDoc from './IntercoderAgreementByDoc';
import IntercoderAgreementByCode from './IntercoderAgreementByCode';
import BinaryDecider from './BinaryDecider';
import ProjectEndpoint from '../endpoints/ProjectEndpoint';
import ValidationEndpoint from '../endpoints/ValidationEndpoint';
import 'script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class IntercoderAgreement extends VexModal {
	constructor(report, history) {
		super();
		const { formatMessage } = IntlProvider.intl;
		this.history = history;
		this.formElements = '';
		if (
			report.averageAgreementCsvString &&
			report.averageAgreementHeaderCsvString
		) {
			var headRow = report.averageAgreementHeaderCsvString.split(',');
			var avgRow = report.averageAgreementCsvString.split(',');
			this.formElements =
				'<div id="intercoderAgreementAverage" style="text-align: center; background-color: #eee; font-color:#222; overflow:hidden; overflow-x: scroll;" class="centerParent">';
			this.formElements += '<table class="centerChild">';
			this.formElements += '<tr>';
			for (var headCell in headRow) {
				this.formElements +=
					'<th  style="text-align: center;" >' + headRow[headCell] + '</th>';
			}
			this.formElements += '</tr>';
			this.formElements += '<tr>';
			for (var cell in avgRow) {
				if (isNaN(cell)) {
					this.formElements +=
						'<td style="padding-right: 5px;">' + avgRow[cell] + '</td>';
				} else {
					this.formElements +=
						'<td style="padding-right: 5px;">' +
						parseFloat(avgRow[cell]).toFixed(4) +
						'</td>';
				}
			}
			this.formElements += '</tr>';
			this.formElements += '</table></div>';
		}
		this.formElements +=
			'<div id="intercoderAgreement" style="text-align: center; background-color: #eee; font-color:#222; overflow:hidden; overflow-x: scroll;"><div id="loadingAnimation" class="centerParent"><div id="reactLoading" class="centerChild"></div></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementTable"></table></div>';

		this.formElements +=
			'<div id="intercoderAgreementMetainformation" style="text-align: center; background-color: #eee; font-color:#222;">' +
			formatMessage({
				id: 'intercoderagreement.eval_method',
				defaultMessage: 'Evaluation Method'
			}) +
			': ' +
			report.evaluationMethod +
			' | ' +
			formatMessage({
				id: 'intercoderagreement.eval_unit',
				defaultMessage: 'Evaluation Unit'
			}) +
			': ' +
			report.evaluationUnit +
			'</div>';

		this.report = report;
		this.results;
	}

	showModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			var formElements = _this.formElements;
			var buttonArray = [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({ id: 'modal.ok', defaultMessage: 'OK' })
				})
			];

			if (_this.report.evaluationMethod === 'f-measure') {
				buttonArray.push(
					$.extend({}, vex.dialog.buttons.NO, {
						className: 'vex-dialog-button-primary',
						text: formatMessage({
							id: 'intercoderagreement',
							defaultMessage: 'Send Email'
						}),
						click: function() {
							var decider = new BinaryDecider(
								formatMessage({
									id: 'intercoderagreement.confirm_email',
									defaultMessage:
										'Confirm sending out emails to all validation coders'
								}),
								formatMessage({ id: 'modal.cancel', defaultMessage: 'Cancel' }),
								formatMessage({
									id: 'intercoderagreement.send_confirm_email',
									defaultMessage: 'Yes, send email'
								})
							);
							decider.showModal().then(function(value) {
								if (value == 'optionB') {
									var validationEndpoint = new ValidationEndpoint();
									validationEndpoint.sendNotificationEmail(_this.report.id);
								}
							});
						}
					})
				);
				buttonArray.push(
					$.extend({}, vex.dialog.buttons.YES, {
						className: 'vex-dialog-button-primary',
						text: formatMessage({
							id: 'intercoderagreement.agreement_maps',
							defaultMessage: 'Agreement Maps'
						}),
						click: function() {
							_this.history.push(
								'/CodingEditor?project=' +
									_this.report.revisionID +
									'&type=REVISION&report=' +
									_this.report.id +
									'&parentproject=' +
									_this.report.projectID
							);
							vex.close(_this);
						}
					})
				);
			}

			vex.dialog.open({
				message: formatMessage({
					id: 'intercoderagreement.intercoderagreement',
					defaultMessage: 'Intercoder Agreement'
				}),
				contentCSS: {
					width: '900px'
				},
				input: formElements,
				buttons: buttonArray,
				callback: function(data) {
					if (data != false) {
						resolve(data);
					} else reject(data);
				}
			});
			ReactDOM.render(
				<ReactLoading color={'#444'} />,
				document.getElementById('reactLoading')
			);

			gapi.client.qdacity.validation
				.listValidationResults({
					reportID: _this.report.id
				})
				.execute(function(resp) {
					if (!resp.code) {
						$('#loadingAnimation').addClass('hidden');
						_this.results = resp.items || [];
						_this.setupDataTable();
					} else {
						// Log error
					}
				});
		});

		return promise;
	}

	setupDataTable() {
		var dataSet = [];
		var _this = this;
		// initialize if not initialized
		if (!$.fn.dataTable.isDataTable('#agreementTable')) {
			var columnsArray = [
				{
					className: 'hidden',
					searchable: true
				},
				{
					className: 'hidden',
					searchable: true
				}
			];
			var columnLabelsArray = this.report.detailedAgreementHeaderCsvString.split(
				','
			);
			var width = 100 / columnLabelsArray.length;
			for (var col in columnLabelsArray) {
				columnsArray = columnsArray.concat([
					{
						title: columnLabelsArray[col],
						width: '' + width + '%'
					}
				]);
			}

			var table1 = $('#agreementTable').dataTable({
				iDisplayLength: 15,
				bLengthChange: false,
				data: dataSet,
				autoWidth: false,
				columns: columnsArray
			});
		}

		$('#agreementTable tbody').on('click', 'tr', function() {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			} else {
				table.$('tr.selected').removeClass('selected');
				$(this).addClass('selected');

				if (_this.report.evaluationMethod === 'f-measure') {
					var resultID = $(this)
						.find('td')
						.eq(0)
						.html();
					var validationProjectID = $(this)
						.find('td')
						.eq(1)
						.html();
					var agreementByDoc = new IntercoderAgreementByDoc(
						resultID,
						validationProjectID,
						_this.report.projectID,
						_this.history
					);
					agreementByDoc.showModal();
				}
				if (
					_this.report.evaluationMethod === 'krippendorffs-alpha' ||
					_this.report.evaluationMethod === 'fleiss-kappa'
				) {
					var agreementByCode = new IntercoderAgreementByCode(
						_this.report.detailedAgreementHeaderCsvString,
						_this.results
					);
					agreementByCode.showModal();
				}
			}
		});

		var table = $('#agreementTable').DataTable();

		table.clear();
		if (typeof this.report != 'undefined') {
			for (var i = 0; i < this.results.length; i++) {
				var result = this.results[i];
				var cells = [result.id, result.validationProjectID];
				table.row.add(cells.concat(result.reportRow.split(',')));
			}
			table.draw();
		}

		$('#agreementTable tbody > tr').addClass('clickable');

		$('#agreementTable tbody').on('click', 'tr', function() {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			} else {
				table.$('tr.selected').removeClass('selected');
				$(this).addClass('selected');
			}
		});
	}

	calculateAgreement() {
		var projectEndpoint = new ProjectEndpoint();
		var _this = this;
		const { formatMessage } = IntlProvider.intl;
		projectEndpoint
			.evaluateRevision(this.revId)
			.then(function(val) {
				_this.valPrjList = val.items;
				_this.setupDataTable(); // FIXME fix reinitialization of datatable
				alertify.success(
					formatMessage({
						id: 'intercoderagreement.agreement',
						defaultMessage: 'Agreement'
					}) +
						': ' +
						val.items[0].paragraphFMeasure
				);
			})
			.catch(handleBadResponse);
	}
}
