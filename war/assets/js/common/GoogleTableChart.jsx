import React from 'react';

import styled from 'styled-components';

const StyledChart = styled.div`
	height: 300px;
`;
export default class GoogleTableChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.drawChart();
	}
	componentDidUpdate() {
		this.drawChart();
	}

	drawChart() {
		var data = this.props.data;
		var options = this.props.options;
		var domElement = document.getElementById(this.props.graphID);
		var chart = new google.visualization.Table(domElement);
		chart.draw(data, options);
	}

	render() {
		return <StyledChart id={this.props.graphID} />;
	}
}
