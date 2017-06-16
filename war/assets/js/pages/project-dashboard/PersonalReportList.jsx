import React from 'react';

import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import IntercoderAgreementByDoc from '../../common/modals/IntercoderAgreementByDoc';

export default class PersonalReportList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reports: []
		};
		this.init()
	}


	getStyles() {
		return {
			listItemBtn: {
				float: "right",
				marginTop: "-15px"
			}
		};
	}

	init() {
		var _this = this;
		var validationEndpoint = new ValidationEndpoint();
		var validationPromise = validationEndpoint.listReports(this.props.parentProject);

		validationPromise.then(function (reports) {
			for (var property in reports) {
				if (reports.hasOwnProperty(property) && property == _this.props.project.revisionID) {
					var reportArr = reports[property]
					reportArr = reportArr || [];
					_this.setState({
						reports: reportArr
					});
				}
			}
		})
	}

	showDocumentResults(report) {
		var _this = this;
		ValidationEndpoint.getValidationResult(report.id, _this.props.project.id).then(function (resp) {
			var agreementByDoc = new IntercoderAgreementByDoc(resp.id, _this.props.project.id, _this.props.project.id, _this.props.projectType);
			agreementByDoc.showModal();
		});
	}


	render() {
		var _this = this;

		const styles = this.getStyles();

		//Render Components

		const renderListItems = this.state.reports.map((report, index) => {
			var datetime = report.datetime;
			if (typeof datetime != 'undefined') datetime = datetime.split("T")[0]; // split to get date only
			else datetime = "";
			return <li 
					className="studentReportLink listItem report" 
					key={report.id}
					onClick={() => this.showDocumentResults(report)}
					>
					{report.name}
				</li>;
		})

		return (
			<div className=" box box-default">
					<div className="box-header with-border">
						<h3 className="box-title">Reports</h3>
					</div>
					<div className="box-body">
						<div>
							<ul className="list compactBoxList" >
								{renderListItems}
							</ul>
						</div>
					</div>
			</div>

		);
	}


}