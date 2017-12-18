import React from 'react';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';
import ChangeLogEndpoint from "../../common/endpoints/ChangeLogEndpoint";

export default class UserRegistrationsChart extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
			userCreatedChanges: null
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

		this.init();
	}

	init() {
		ChangeLogEndpoint.getChanges("USER", "CREATED", this.props.minDate, this.props.maxDate).then((result) => {
			result.items = result.items || [];
			this.setState({
				userCreatedChanges: result.items
			})
		});
	}

	getDataRows(changes) {
		const dict = {};

		for(const iteratingDate = new Date(); this.props.minDate <= iteratingDate; iteratingDate.setDate(iteratingDate.getDate() - 1)) {
			dict[new Date(iteratingDate.getFullYear(), iteratingDate.getMonth(), iteratingDate.getDate()).toISOString()] = 0;
		}

		changes.forEach((e) => {
			const date = new Date(e.datetime);
			const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
			dict[day]++;
		});

		const result = [];
		Object.keys(dict).forEach((key) => {
			result.push([new Date(key), dict[new Date(key).toISOString()]]);
		});

		return result;
	}

	renderChart() {

		const data = new google.visualization.DataTable();

		data.addColumn('date', 'Day');
		data.addColumn('number', 'User registrations');

		data.addRows(this.getDataRows(this.state.userCreatedChanges));

		const options = {
			width: 700,
			height: 400,
			hAxis: {
				format: 'MMM dd, yyyy',
				gridlines: {count: 15},
			},
			vAxis: {
				gridlines: {color: 'none'},
				viewWindowMode: "pretty"
			},
			legend: {
				position: "none"
			},
			chartArea: {
				left: 70,
				right: 0,
				top: 10
			}
		};


		return (
			<GoogleLineChart graphID="userRegistrationsChart" data={data} options={options}/>
		);

	}

	render() {
		return (
			<div>
				{this.state.googleChartsLoaded && this.state.userCreatedChanges ? this.renderChart() : null}
			</div>
		);
	}
}