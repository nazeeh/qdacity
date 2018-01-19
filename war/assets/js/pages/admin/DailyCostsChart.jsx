import React from 'react';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';
import ChartTimeFrameChooser from './ChartTimeFrameChooser.jsx';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import BillingStatsEndpoint from '../../common/endpoints/BillingStatsEndpoint';

export default class DailyCostsChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
			dailyCosts: null,
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

	fetchDailyCosts() {
		BillingStatsEndpoint.getDailyCosts(
			this.state.startDate,
			this.state.endDate
		).then(result => {
			result.costsByService = result.costsByService || {};
			this.setState({
				dailyCosts: result.costsByService
			});
		});
	}

	getDataRows(dailyCosts) {
		const dict = {};

		for (
			const iteratingDate = new Date(this.state.endDate.getTime());
			this.state.startDate <= iteratingDate;
			iteratingDate.setDate(iteratingDate.getDate() - 1)
		) {
			dict[
				new Date(
					iteratingDate.getFullYear(),
					iteratingDate.getMonth(),
					iteratingDate.getDate()
				).toISOString()
			] = 0;
		}

		Object.keys(dailyCosts).forEach(key => {
			const date = new Date(key);
			const day = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			).toISOString();
			dict[day] = dailyCosts[key];
		});

		const result = [];
		Object.keys(dict).forEach(key => {
			result.push([new Date(key), dict[new Date(key).toISOString()]]);
		});

		return result;
	}

	setTimeFrame(startDate, endDate) {
		this.setState(
			{
				startDate: startDate,
				endDate: endDate,
				dailyCosts: null
			},
			() => this.fetchDailyCosts()
		);
	}

	renderChart() {
		const data = new google.visualization.DataTable();

		const { formatMessage } = IntlProvider.intl;

		data.addColumn(
			'date',
			formatMessage({ id: 'dailycostschart.axis_day', defaultMessage: 'Day' })
		);
		data.addColumn(
			'number',
			formatMessage({
				id: 'dailycostschart.axis_costs',
				defaultMessage: 'Costs'
			})
		);

		data.addRows(this.getDataRows(this.state.costsByService));

		const options = {
			width: 700,
			height: 400,
			hAxis: {
				format: 'MMM dd, yyyy',
				gridlines: { count: 15 }
			},
			vAxis: {
				gridlines: { color: 'none' },
				viewWindowMode: 'pretty'
			},
			legend: {
				position: 'none'
			},
			chartArea: {
				left: 70,
				right: 0,
				top: 10
			}
		};

		return (
			<GoogleLineChart
				graphID="dailyCostsChart"
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
				this.state.costsByService &&
				this.state.startDate &&
				this.state.endDate
					? this.renderChart()
					: null}
			</div>
		);
	}
}
