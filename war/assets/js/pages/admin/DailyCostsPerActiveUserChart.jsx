import React from 'react';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';
import ChartTimeFrameChooser from './ChartTimeFrameChooser.jsx';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import BillingStatsEndpoint from '../../common/endpoints/BillingStatsEndpoint';
import EventsEndpoint from '../../common/endpoints/EventsEndpoint';

export default class DailyCostsPerActiveUserChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
			dailyCosts: null,
			dailyUserLoginEvents: null,
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
			result.dailyCosts = result.dailyCosts || {};
			this.setState({
				dailyCosts: result.dailyCosts
			});
		});
	}

	fetchEvents() {
		EventsEndpoint.getEvents(
			'DAILY_USER_LOGIN',
			null,
			this.state.startDate,
			this.state.endDate
		).then(result => {
			result.items = result.items || [];
			this.setState({
				dailyUserLoginEvents: result.items
			});
		});
	}

	getDataRows(dailyCosts, changes) {
		const dict1 = {};
		const dict2 = {};

		for (
			const iteratingDate = new Date(this.state.endDate.getTime());
			this.state.startDate <= iteratingDate;
			iteratingDate.setDate(iteratingDate.getDate() - 1)
		) {
			let date = new Date(
				iteratingDate.getFullYear(),
				iteratingDate.getMonth(),
				iteratingDate.getDate()
			).toISOString();
			dict1[date] = 0;
			dict2[date] = 0;
		}

		Object.keys(dailyCosts).forEach(key => {
			const date = new Date(key);
			const day = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			).toISOString();
			dict1[day] = dailyCosts[key];
		});

		changes.forEach(e => {
			const date = new Date(e.datetime);
			const day = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			).toISOString();
			dict2[day]++;
		});

		const result = [];
		Object.keys(dict1).forEach(key => {
			let dictKey = new Date(key).toISOString();
			let resultValue = dict1[dictKey] / dict2[dictKey];
			if (isFinite(resultValue)) {
				result.push([new Date(key), resultValue]);
			} else {
				result.push([new Date(key), NaN]);
			}
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
			() => {
				this.fetchDailyCosts();
				this.fetchEvents();
			}
		);
	}

	renderChart() {
		const data = new google.visualization.DataTable();

		const { formatMessage } = IntlProvider.intl;

		data.addColumn(
			'date',
			formatMessage({
				id: 'daily_costs_per_active_user_chart.axis_day',
				defaultMessage: 'Day'
			})
		);
		data.addColumn(
			'number',
			formatMessage({
				id: 'daily_costs_per_active_user_chart.axis_costs_per_active_user',
				defaultMessage: 'Costs per active user'
			})
		);

		data.addRows(
			this.getDataRows(this.state.dailyCosts, this.state.dailyUserLoginEvents)
		);

		const options = {
			width: 540,
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
				graphID="dailyCostsPerActiveUserChart"
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
				this.state.dailyCosts &&
				this.state.dailyUserLoginEvents &&
				this.state.startDate &&
				this.state.endDate
					? this.renderChart()
					: null}
			</div>
		);
	}
}
