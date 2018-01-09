import React from 'react';
import {
	FormattedMessage
} from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import 'script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import SaturationWeights from '../saturation/SaturationWeights';
import SaturationAverage from '../saturation/SaturationAverage';
import SaturationCategoryDetail from '../saturation/SaturationCategoryDetail.jsx';

export default class SaturationDetails extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.initTable();
	}
	componentDidUpdate() {
		// TODO: check if this blocks update on language change
		if (this.props.saturation) {
			this.initTable();
			this.drawDataTable();
		}
	}

	initTable() {
		const {
			formatMessage,
			formatDate
		} = IntlProvider.intl;
		var dataSet = [];
		var tableMount = $('#saturationTable');
		var columnsArray = [];
		var columnLabelsArray = [
			formatMessage({
				id: 'saturationdetails.change_category',
				defaultMessages: 'Change Category'
			}),
			formatMessage({
				id: 'saturationdetails.saturation',
				defaultMessages: 'Saturation'
			}),
			formatMessage({
				id: 'saturationdetails.weight',
				defaultMessages: 'Weight (Importance)'
			}),
			formatMessage({
				id: 'saturationdetails.configured_maximum',
				defaultMessages: 'Configured Maximum'
			})
		];
		var width = 100 / (columnLabelsArray.length);
		for (var col in columnLabelsArray) {
			columnsArray = columnsArray.concat([{
				"title": columnLabelsArray[col],
				"width": "" + width + "%"
			}]);

		}

		var table = tableMount.dataTable({
			"paging": false,
			"scrollY": "170px",
			"bLengthChange": false,
			"data": dataSet,
			"autoWidth": false,
			"columns": columnsArray,
			"aaSorting": [
				[1, 'asc'],
				[2, 'desc']
			],
		});
	}

	drawDataTable() {
		if (typeof this.props.saturation !== 'undefined') {
			var table = $('#saturationTable').DataTable();
			table.clear();

			var saturationWeights = new SaturationWeights(this.props.saturation.saturationParameters);
			var satCategories = saturationWeights.getCategorizedArray();
			var satAvg = new SaturationAverage(this.props.saturation);

			for (var i in satCategories) {
				var categoryAvg = satAvg.averageForCategory(i);
				table.row.add([i, this.toPercent(categoryAvg[0]), this.toPercent(categoryAvg[1]), this.toPercent(categoryAvg[2])]);
			}

			var _this = this;
			$('#saturationTable tbody').on('click', 'tr', function () {
				var categoryId = $(this).find("td").eq(0).html();
				var saturationCatDetails = new SaturationCategoryDetail(saturationWeights.getCompleteCategory(_this.props.saturation, categoryId), categoryId);
				saturationCatDetails.showModal();


			});

			table.draw();

		}
	}

	toPercent(value) {
		return (value * 100).toFixed(2) + "%";
	}

	render() {
		const {
			formatMessage,
			formatDate
		} = IntlProvider.intl;
		if (!this.props.saturation)
			return null;
		return (<div>
			<p><FormattedMessage id='saturationdetails.last_calculation' defaultMessage='Last calculation of saturation is from {startDate} to {endDate}' values={{
				startDate: formatDate(this.props.saturation.evaluationStartDate),
				endDate: formatDate(this.props.saturation.creationTime)
			}} /></p>
            <table id="saturationTable" className="display">

            </table>
            <p><FormattedMessage id='saturationdetails.parameters' defaultMessage='Parameters used from : {date}' values={{
				date: formatDate(this.props.saturation.saturationParameters.creationTime)
			}} /></p>
        </div>);
	}

}