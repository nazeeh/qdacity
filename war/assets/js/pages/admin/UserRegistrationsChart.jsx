import React from 'react';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';
import ChangeLogEndpoint from "../../common/endpoints/ChangeLogEndpoint";

export default class UserRegistrationsStats extends React.Component {

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
		const startDate = new Date();
		startDate.setMonth(startDate.getMonth() - 1);
		const endDate = new Date();
		ChangeLogEndpoint.getChanges("USER", "CREATED", startDate, endDate).then((result) => {
			this.setState({
				userCreatedChanges: result.items
			})
		});
	}

	getDataRows(changes) {
		const dict = {};

		const minDate = new Date();
		minDate.setMonth(minDate.getMonth() - 1);
		const iteratingDate = new Date();
		while(minDate <= iteratingDate) {
			dict[new Date(iteratingDate.getFullYear(), iteratingDate.getMonth(), iteratingDate.getDate()).toISOString()] = 0;
			iteratingDate.setDate(iteratingDate.getDate() - 1);
		}


		changes.forEach((e) => {
			const date = new Date(e.datetime);
			const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
				dict[day]++;
		});

		const keys = Object.keys(dict);
		keys.sort();

		const result = [];
		keys.forEach((key) => {
			result.push([new Date(key), dict[new Date(key).toISOString()]]);
		});

		return result;
	}

	renderChart() {

		const data = new google.visualization.DataTable();

		data.addColumn('date', 'Day');
		data.addColumn('number', 'User registrations');

		data.addRows(this.getDataRows(this.state.userCreatedChanges));


		const minDate = new Date();
		minDate.setMonth(minDate.getMonth() - 1);
		const options = {
			title: 'User registrations in the last month',
			width: 800,
			height: 400,
			hAxis: {
				format: 'MMM dd, yyyy',
				gridlines: {count: 15},
				minValue: minDate,
				maxValue: new Date()
			},
			vAxis: {
				gridlines: {color: 'none'},
				viewWindowMode: "pretty"
			},
			legend: {
				position: "none"
			}
		};


		return (
			<GoogleLineChart graphID="bla" data={data} options={options}/>
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