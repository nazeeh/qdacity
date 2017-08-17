import React from 'react';
import Theme from '../../../common/styles/Theme.js';

import ValidationEndpoint from '../../../common/endpoints/ValidationEndpoint';
import IntercoderAgreement from '../../../common/modals/IntercoderAgreement';

import {
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledBoxList,
	StyledListItemDefault
} from '../../../common/styles/List';

export default class ReportList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reports: this.props.reports,
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.paginationClick = this.paginationClick.bind(this);
	}

	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}


	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}



	deleteReport(e, reportId, index) {
		var _this = this;
		e.stopPropagation();
		var validationEndpoint = new ValidationEndpoint();

		validationEndpoint.deleteReport(reportId)
			.then(
				function (val) {
					alertify.success("Report has been deleted");
					_this.state.reports.splice(index, 1);
					_this.setState({
						reports: _this.state.reports
					})
				})
	}

	showValidationReports(report) {
		var agreementModal = new IntercoderAgreement(report);
		agreementModal.showModal();
	}


	renderReportDeleteBtn(report, index) {
		if (this.props.isAdmin || this.props.isProjectOwner)
			return <StyledListItemBtn onClick={(e) => this.deleteReport(e, report.id, index)} className="btn fa-lg"  color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
						<i className="fa fa-trash"></i>
					</StyledListItemBtn>;
		else return '';
	}

	render() {
		var _this = this;

		//Render Components

		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.reports.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
		}

		const renderListItems = itemsToDisplay.map((report, index) => {
			var datetime = report.datetime;
			if (typeof datetime != 'undefined') datetime = datetime.split("T")[0]; // split to get date only
			else datetime = "";
			return <StyledListItemDefault key={report.id} onClick={() => this.showValidationReports(report)}  clickable={true}>
					<span className="reportName"> {report.name} </span>
					<span>
						<span >{'[' + datetime + '] '}</span>
						<span>{this.renderReportDeleteBtn(report, index)}</span>
					</span>

				</StyledListItemDefault>;
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.reports.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<StyledPaginationItem
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				<StyledBoxList>
					{renderListItems}
	            </StyledBoxList>
	            <StyledPagination className="pagination">
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}