import React from 'react';
import Slider from 'react-slick';

import GoogleColumnChart from '../../common/GoogleColumnChart.jsx';

//import 'script!slick-carousel';


export default class AgreementStats  extends React.Component{

	constructor(props) {
		super(props);
		
		google.charts.load('current', {
			packages: ['corechart', 'bar']
		});


		this.state = {
			reports: []
		};
		
		this.options = {
			title: 'Agreement by Document',
			colors: ['#00a65a', '#5f5f5f', '#797979', '#929292', '#337ab7'],
			hAxis: {
				title: 'Documents',
				format: 'h:mm a',

			},
			vAxis: {
				title: 'Agreement',
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
		//this.componentDidMount = this.componentDidMount.bind(this);
		
/*var _this = this;
google.charts.setOnLoadCallback(function () {
		_this.forceUpdate();
		});*/
	}

	addReports(reports) {
		var _this = this;
		var reports = this.state.reports.concat(reports);
		this.setState({
			reports: reports
		});
/*		google.charts.setOnLoadCallback(function () {
			reports.forEach(function (report) {
				if (typeof report.documentResults != 'undefined') {
					//Create node for report
					var div = document.createElement("div");
					_this.documentResults.append(div);

					// Add chart
					_this.drawReport(report, div);

					// Prepend title
					var title = document.createElement("h4");
					title.innerHTML = "<b>" + report.name + "</b>";
					div.insertBefore(title, div.firstChild);
				}

			});

			if (_this.slickInitialized) {
				_this.documentResults.slick('unslick');

			} else {
				_this.slickInitialized = true;
			}

			_this.documentResults.slick({
				dots: true
			});
		});*/
	}
	
	
	/*
	
	componentDidMount(){
		var domElement = $(document.getElementById("agreementStats"));

			domElement.slick({
				dots: true
			});
			
			
			this.slickInitialized = false;
	}
	componentDidUpdate(){	
	var domElement = $(document.getElementById("agreementStats"));

domElement.slick('unslick');
		domElement.slick({
			dots: true
		});
		
		
		this.slickInitialized = false;
	}
	*/
	renderReport(report, chartID, index) {
		
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Document');
		data.addColumn('number', 'F-Measure');
		data.addColumn('number', 'Recall');
		data.addColumn('number', 'Precision');

		report.documentResults.forEach(function (docResult) {
			var cells = docResult.reportRow.split(",");
			data.addRow([cells[0], parseFloat(cells[1]), parseFloat(cells[2]), parseFloat(cells[3])]);
		});
		
		return(
			<GoogleColumnChart key={"agreementChart_"+ report.id + "_" + index} graphID={"agreementChartId_"+ report.id + "_" + index} data={data} options={this.options}/> 
		);

	}
	
	renderCharts(){
		var _this = this;
		if (this.state.reports.length == 0) return (<div></div>);
		return this.state.reports.map((report, index) => {
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
	
	render(){
		var settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    

		return (
		<div>
		
			<Slider {...settings}>
				{this.renderCharts()}
			</Slider>
		</div>
		);
	}
}