import React from 'react';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';


export default class ProjectStats extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			docCount: "N/A",
			codeCount: "N/A",
			codingCount: "N/A"
		};

		this.init();
	}

	init() {
		var _this = this;
		ProjectEndpoint.getProjectStats(this.props.project.getId(), this.props.project.getType()).then(function (resp) {
			_this.setState({
				docCount: resp.documentCount,
				codeCount: resp.codeCount,
				codingCount: resp.codingCount
			});
		});
	}

	render() {
		var _this = this;

		return (
			<div className="box box-default">
				<div className="box-header with-border">
				<h3 className="box-title">Project Stats</h3>
				</div>
				<div className="box-body">
				<div className="row" >
					<div className="col-lg-3 col-xs-6 small-gutter-right">
						<div className="info-box">
							<div className="info-box-icon bg-aqua">
							<i className="fa fa-file-o "></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Documents</span>
								<span className="info-box-number">
									{this.state.docCount}
								</span>
							</div>
						</div>
					</div>
					
			
					<div className="col-lg-3 col-xs-6 small-gutter">
						<div className="info-box">
							<div className="info-box-icon bg-yellow">
							<i className="fa fa-tag"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Codes</span>
								<span className="info-box-number">
									{this.state.codeCount}
								</span>
							</div>
						</div>
					</div>
					
					<div className="col-lg-3 col-xs-6 small-gutter">
						<div className="info-box">
							<div className="info-box-icon bg-red">
							<i className="fa fa-tags"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Codings</span>
								<span className="info-box-number">
									{this.state.codingCount}
								</span>
							</div>
						</div>
						
					</div>
					
					<div className="col-lg-3 col-xs-6 small-gutter-left">
					<div className="info-box">
							<div className="info-box-icon bg-green">
							<i className="fa fa-bar-chart"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Saturation</span>
								<span className="info-box-number">N/A</span>
							</div>
						</div>
					</div>
					
				</div>
				</div>
			</div>
		);
	}


}