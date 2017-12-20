import React from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import Slider from 'react-slick';
import styled from 'styled-components';

import GoogleColumnChart from '../../common/GoogleColumnChart.jsx';

const StyledAgreementStats = styled.div `
    margin-left:25px;
	margin-right:25px;
	padding-top: 5px;
	padding-bottom: 20px;
`;

export default class AgreementStats extends React.Component {

	constructor(props) {
		super(props);

		google.charts.load('current', {
			packages: ['corechart', 'bar']
		});

		this.state = {
			reports: []
		};

		//this.componentDidMount = this.componentDidMount.bind(this);

		/*var _this = this;
		google.charts.setOnLoadCallback(function () {
				_this.forceUpdate();
				});*/
	}

	getOptions() {
		const {formatMessage} = IntlProvider.intl;
		return {
			title: formatMessage({id: 'agreementstats.agreement_by_document', defaultMessage: 'Agreement by Document'}),
			colors: ['#00a65a', '#5f5f5f', '#797979', '#929292', '#337ab7'],
			hAxis: {
				title: formatMessage({id: 'agreementstats.documents', defaultMessage: 'Documents'}),
				format: 'h:mm a',

			},
			vAxis: {
				title: formatMessage({id: 'agreementstats.agreement', defaultMessage: 'Agreement'}),
				viewWindow: {
					min: 0,
					max: 1
				}
			},
			chartArea: {
				left: '8%',
				top: '8%',
				width: "70%",
				height: "70%"
			}
		};
	}

	addReports(reports) {
		var _this = this;
		var reports = this.state.reports.concat(reports);
		this.setState({
			reports: reports
		});
	}

	renderReport(report, index) {
		const {formatMessage} = IntlProvider.intl;

		var data = new google.visualization.DataTable();
		data.addColumn('string', formatMessage({ id: 'agreementstats.document', defaultMessage: 'Document'}));
		data.addColumn('number', formatMessage({ id: 'agreementstats.f_measure', defaultMessage: 'F-Measure'}));
		data.addColumn('number', formatMessage({ id: 'agreementstats.recall', defaultMessage: 'Recall'}));
		data.addColumn('number', formatMessage({ id: 'agreementstats.precision', defaultMessage: 'Precision'}));

		report.documentResults.forEach(function (docResult) {
			var cells = docResult.reportRow.split(",");
			data.addRow([cells[0], parseFloat(cells[1]), parseFloat(cells[2]), parseFloat(cells[3])]);
		});

		return (
			<GoogleColumnChart key={"agreementChart_"+ report.id + "_" + index} graphID={"agreementChartId_"+ report.id + "_" + index} data={data} options={this.getOptions()}/>
		);

	}

	renderCharts() {
		var _this = this;
		if (this.props.reports.length == 0) return (<div></div>);
		return this.props.reports.map((report, index) => {
			if (!report.documentResults) return '';
			return (
				<div key={"agreementChartContainer_"+ report.id + "_" + index}>
					<h4 key={"agreementChartHeader_"+ report.id + "_" + index}>
					<b>{report.name}</b>
					</h4>
					{_this.renderReport(report, index)}
				</div>
			);
		})
	}

	render() {
		// If infinite is set to true the last slide is copied in front of the first and the first after the last.
		// This also copies the IDs which GoogleChart uses to render content.
		// Then, if the last slide is selected the content gets rendered into the invisible div inserted before the first.
		var settings = {
			dots: true,
			infinite: false,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true
		};


		return (
			<StyledAgreementStats>
				<Slider {...settings}>
					{this.renderCharts()}
				</Slider>
			</StyledAgreementStats>
		);
	}
}