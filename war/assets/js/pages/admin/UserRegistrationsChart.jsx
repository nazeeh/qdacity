import React from 'react';
import styled from 'styled-components';

import GoogleLineChart from '../../common/GoogleLineChart.jsx';

export default class UserRegistrationsStats extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			googleChartsLoaded: false,
			dataRows: []
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

		this.createDataRows(this.props.userCreatedChanges);
	}

	createDataRows(changes) {
		let result = [];
		changes.forEach((e) => {

			result.append()
		});
	}

	componentWillReceiveProps(nextProps) {
		if(JSON.stringify(this.props.dataRows) !== JSON.stringify(nextProps.dataRows))
		{
			this.createDataRows(nextProps.userCreatedChanges);
		}
	}


	renderChart() {

		let data = new google.visualization.DataTable();
		data.addColumn('string', 'Month');
		data.addColumn('number', 'User registrations');

		data.addRows(this.state.dataRows);

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