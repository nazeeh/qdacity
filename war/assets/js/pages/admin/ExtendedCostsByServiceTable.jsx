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
				packages: ['corechart']
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
			result.serviceCosts = result.serviceCosts || {};
			this.setState({
				extendedCostsByService: result.serviceCosts
			});
		});
	}

	getDataRows(costsByService) {

		const result = [];
		Object.keys(costsByService).forEach(key => {
			result.push([key, costsByService[key]]);
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
			'number',
			formatMessage({
				id: 'extended_costs_by_service_table.costs',
				defaultMessage: 'Costs'
			})
		);

		data.addRows(this.getDataRows(this.state.extendedCostsByService));

		const options = {
			pieHole: 0.4,
			width: 540,
			height: 400,
			chartArea: {
				left: 70,
				right: 0,
				top: 10
			}
		};

		data.sort([{column: 1, desc: true}]);

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
