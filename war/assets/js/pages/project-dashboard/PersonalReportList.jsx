import React from 'react';
import { FormattedMessage } from 'react-intl';

import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import IntercoderAgreementByDoc from '../../common/modals/IntercoderAgreementByDoc';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

export default class PersonalReportList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reports: []
		};

		this.renderReport = this.renderReport.bind(this);

		if (this.props.project.getType() == 'VALIDATION') this.init();
	}

	init() {
		var _this = this;
		var validationEndpoint = new ValidationEndpoint();
		var validationPromise = validationEndpoint.listReports(
			this.props.project.getParentID()
		);

		validationPromise.then(function(reports) {
			for (var property in reports) {
				if (
					reports.hasOwnProperty(property) &&
					property == _this.props.project.getRevisionID()
				) {
					var reportArr = reports[property];
					reportArr = reportArr || [];
					_this.setState({
						reports: reportArr
					});
				}
			}
		});
	}

	showDocumentResults(report) {
		var _this = this;
		if (report.evaluationMethod == 'f-measure') {
			ValidationEndpoint.getValidationResult(
				report.id,
				_this.props.project.getId()
			).then(function(resp) {
				var agreementByDoc = new IntercoderAgreementByDoc(
					resp.id,
					_this.props.project.getId(),
					_this.props.project.getId(),
					_this.props.history
				);
				agreementByDoc.showModal();
			});
		}
	}

	renderReport(report, index) {
		var datetime = report.datetime;
		if (typeof datetime != 'undefined')
			datetime = datetime.split('T')[0]; // split to get date only
		else datetime = '';
		return (
			<StyledListItemDefault
				key={report.id}
				clickable={true}
				onClick={() => this.showDocumentResults(report)}
			>
				{report.name}
			</StyledListItemDefault>
		);
	}

	render() {
		if (this.props.project.getType() != 'VALIDATION') return null;

		return (
			<div className=" box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">
						<FormattedMessage
							id="personalreportlist.reports"
							defaultMessage="Reports"
						/>
					</h3>
				</div>
				<div className="box-body">
					<div>
						<ItemList
							hasPagination={true}
							itemsPerPage={8}
							items={this.state.reports}
							renderItem={this.renderReport}
						/>
					</div>
				</div>
			</div>
		);
	}
}
