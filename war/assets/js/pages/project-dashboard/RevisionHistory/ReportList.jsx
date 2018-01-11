import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../../common/styles/Theme.js';

import ValidationEndpoint from '../../../common/endpoints/ValidationEndpoint';
import IntercoderAgreement from '../../../common/modals/IntercoderAgreement';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault,
} from '../../../common/styles/ItemList.jsx';

const StyledReportDate = styled.span `
	width:85px;
`;

export default class ReportList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			reports: this.props.reports
		};

		this.renderReport = this.renderReport.bind(this);
	}

	deleteReport(e, reportId, index) {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var validationEndpoint = new ValidationEndpoint();

		validationEndpoint.deleteReport(reportId)
			.then(
				function (val) {
					alertify.success(
						formatMessage({
							id: 'reportlist.report_deleted',
							defaultMessage: "Report has been deleted"
						})
					);
					_this.state.reports.splice(index, 1);
					_this.setState({
						reports: _this.state.reports
					})
				})
	}

	showValidationReports(report) {
		var agreementModal = new IntercoderAgreement(report, this.props.history);
		if (this.props.isProjectOwner) agreementModal.showModal();
	}

	renderReportDeleteBtn(report, index) {
		if (this.props.isAdmin || this.props.isProjectOwner)
			return (
				<StyledListItemBtn onClick={(e) => this.deleteReport(e, report.id, index)} className="btn fa-lg"  color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
					<i className="fa fa-trash"></i>
				</StyledListItemBtn>
			);
		else return '';
	}

	renderReport(report, index) {
		var datetime = report.datetime;

		if (typeof datetime != 'undefined') datetime = datetime.split("T")[0]; // split to get date only
		else datetime = "";

		return (
			<StyledListItemDefault key={report.id} onClick={() => this.showValidationReports(report)}  clickable={true}>
                <span> {report.name} </span>
                <span>
                    <StyledReportDate >{'[' + datetime + '] '}</StyledReportDate>
                    {this.renderReportDeleteBtn(report, index)}
                </span>

            </StyledListItemDefault>
		);
	}

	render() {
		return (
			<ItemList 
                hasPagination={true}
                itemsPerPage={8}
                items={this.state.reports} 
                renderItem={this.renderReport} />
		);
	}
}