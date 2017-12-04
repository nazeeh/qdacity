import React from 'react';
import styled from 'styled-components';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';

export default class UserRegistrationsStats extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false
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

		this.options = {
			title: 'User registrations by month',
			width: 600,
			height: 400
		};
	}

	renderChart() {

		let data = new google.visualization.DataTable();
		data.addColumn('string', 'Month');
		data.addColumn('number', 'User registrations');

		data.addRow(["11", 2]);
		data.addRow(["12", 1]);
		data.addRow(["1", 7]);

		return (
			<GoogleLineChart graphID="bla" data={data} options={this.options}/>
		);

	}

	render() {

		return (
			<div>
				{this.state.googleChartsLoaded ? this.renderChart() : null}
			</div>
		);
	}
}