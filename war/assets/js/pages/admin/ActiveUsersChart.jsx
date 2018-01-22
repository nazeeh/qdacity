import React from 'react';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';
import ChartTimeFrameChooser from './ChartTimeFrameChooser.jsx';
import EventsEndpoint from '../../common/endpoints/EventsEndpoint';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class ActiveUsersChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
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

	getDataRows(changes) {
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

		changes.forEach(e => {
			const date = new Date(e.datetime);
			const day = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			).toISOString();
			dict[day]++;
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
				dailyUserLoginEvents: null
			},
			() => this.fetchEvents()
		);
	}

	renderChart() {
		const data = new google.visualization.DataTable();

		const { formatMessage } = IntlProvider.intl;

		data.addColumn(
			'date',
			formatMessage({ id: 'activeuserschart.axis_day', defaultMessage: 'Day' })
		);
		data.addColumn(
			'number',
			formatMessage({
				id: 'activeuserschart.axis_users',
				defaultMessage: 'Active Users'
			})
		);

		data.addRows(this.getDataRows(this.state.dailyUserLoginEvents));

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
				graphID="activeUsersChart"
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
				this.state.dailyUserLoginEvents &&
				this.state.startDate &&
				this.state.endDate
					? this.renderChart()
					: null}
			</div>
		);
	}
}
