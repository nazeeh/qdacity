import React from 'react';

import GoogleTableChart from "../../common/GoogleTableChart.jsx";
import ChartTimeFrameChooser from './ChartTimeFrameChooser.jsx';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import BillingStatsEndpoint from '../../common/endpoints/BillingStatsEndpoint';

export default class ExtendedCostsByServiceTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
			extendedCostsByService: null,
			startDate: null,
			endDate: null
		};

		this.props.chartScriptPromise.then(() => {
			google.charts.load('current', {
				packages: ['table']
			});

			google.charts.setOnLoadCallback(() => {
				this.setState({
					googleChartsLoaded: true
				});
			});
		});
	}

	fetchExtendedCostsByService() {
		BillingStatsEndpoint.getExtendedCostsByService(
			this.state.startDate,
			this.state.endDate
		).then(result => {
			result.items = result.items || [];
			this.setState({
				extendedCostsByService: result.items
			});
		});
	}

	getDataRows(costsByService) {

		const result = [];

		const currencyFormatter = new Intl.NumberFormat('de', {
			style: 'currency',
			currency: 'EUR',
		});

		costsByService.forEach(item => {
			result.push([item.service, item.description, currencyFormatter.format(item.cost)]);
		});

		return result;
	}

	setTimeFrame(startDate, endDate) {
		this.setState(
			{
				startDate: startDate,
				endDate: endDate,
				extendedCostsByService: null
			},
			() => this.fetchExtendedCostsByService()
		);
	}

	renderChart() {
		const data = new google.visualization.DataTable();

		const { formatMessage } = IntlProvider.intl;

		data.addColumn(
			'string',
			formatMessage({ id: 'extended_costs_by_service_table.service', defaultMessage: 'Service' })
		);
		data.addColumn(
			'string',
			formatMessage({ id: 'extended_costs_by_service_table.description', defaultMessage: 'Description' })
		);
		data.addColumn(
			'string',
			formatMessage({
				id: 'extended_costs_by_service_table.costs',
				defaultMessage: 'Costs'
			})
		);

		data.addRows(this.getDataRows(this.state.extendedCostsByService));

		const options = {
			width: 540,
			height: 300,
			allowHtml: true,
			sortColumn: 2,
			sortAscending: false,
		};
		data.setProperty(0, 0, 'style', 'width:150px');
		data.setProperty(0, 1, 'style', 'width:250px');

		data.sort([{column: 2, desc: true}]);

		return (
			<GoogleTableChart
				graphID="extendedCostsByServiceChart"
				data={data}
				options={options}
			/>
		);
	}

	render() {
		return (
			<div>
				<ChartTimeFrameChooser
					onChangeTimeFrame={(startDate, endDate) =>
						this.setTimeFrame(startDate, endDate)
					}
				/>
				{this.state.googleChartsLoaded &&
				this.state.extendedCostsByService &&
				this.state.startDate &&
				this.state.endDate
					? this.renderChart()
					: null}
			</div>
		);
	}
}
