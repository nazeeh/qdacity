import React from 'react';

import ValidationEndpoint from '../../../common/endpoints/ValidationEndpoint';
import IntercoderAgreement from '../../../common/modals/IntercoderAgreement';

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


	getStyles() {
		return {
			pagination: {
				listStyle: "none",
				display: "flex"
			},
			paginationItem: {
				color: "black",
				float: "left",
				padding: "8px 16px",
				textDecoration: "none",
				cursor: "pointer"

			},
			listItemBtn: {
				float: "right",
				marginTop: "-15px"
			}
		};
	}
	
		
	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}
	
	
	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}
	


	deleteReport(e, reportId, index){
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
	
	showValidationReports(report){
		var agreementModal = new IntercoderAgreement(report);
		agreementModal.showModal();
	}
	
	
	renderReportDeleteBtn(report, index) {
		const styles = this.getStyles();
	
		if (this.props.isAdmin || this.props.isProjectOwner) 
			return <a onClick={(e) => this.deleteReport(e, report.id, index)} className="btn  fa-stack fa-lg" style={styles.listItemBtn}>
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</a>;
		else return '';
	}

	render() {
		var _this = this;

		const styles = this.getStyles();

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
			return <li key={report.id} onClick={() => this.showValidationReports(report)}  className="clickable">
					<span className="reportName"> {report.name} </span>
					{this.renderReportDeleteBtn(report, index)}
					<span className="reportDate">{'[' + datetime + ']'}</span>
					
				</li>;
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.reports.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<a
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              style={styles.paginationItem}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
	            </a>
			);
		});

		return (
			<div>
				<ul className="list compactBoxList">
					{renderListItems}
	            </ul>
	            <ul className="pagination" style={styles.pagination}>
					{renderPagination}
            	</ul>
     		</div>
		);
	}


}