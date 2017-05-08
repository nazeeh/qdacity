import React from 'react';

import ReportList from './ReportList.jsx';
import ValPrjList from './ValPrjList.jsx';

import ValidationEndpoint from '../../../common/endpoints/ValidationEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';

import CustomForm from '../../../common/modals/CustomForm';

export default class RevisionHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			revisions: [],
			validationProjects: [],
			reports: [],
			isAdmin: false,
			isProjectOwner: false
		};
		
		this.renderReports = this.renderReports.bind(this);
		this.addRevision = this.addRevision.bind(this);
	}
	
	getStyles() {
		return {
			pagination: {
				listStyle: "none",
				display: "flex"
			},
			createReportBtn:{
				marginTop:"-6px",
				padding: "5px 10px"
			},
			listItemBtn:{
				float:"right",
				margintop:"-18px"
			},
			btnIcon:{
				fontSize: "18px"
			}
			
		};
	}

	init() {
		var _this = this;
		_this.state.revisions = [];
		var validationEndpoint = new ValidationEndpoint();


		var validationPromise = validationEndpoint.listReports(_this.props.projectID);

		ProjectEndpoint.listRevisions(_this.props.projectID).then(function (revisionResp) {
			
			_this.setState({
				revisions: revisionResp.items
			});
		});
	}
	
	setRights(prjId, user){
		var isAdmin =  user.type === "ADMIN";
		
		var isProjectOwner = false;
		if (typeof user.projects != 'undefined') isProjectOwner = user.projects.indexOf(prjId) !== -1;
		
		this.setState({
			isAdmin: isAdmin,
			isProjectOwner:isProjectOwner
		});
	}
	
	
	setRevisions(pRevisions){
		this.setState({
			revisions: pRevisions
		});
	}
	
	setValidationProjects(pValidationProjects){
		this.setState({
			validationProjects: pValidationProjects
		});
	}
	
	setReports(pReports){
		this.setState({
			reports: pReports
		});
	}
	
	addRevision(pRevision){
		this.state.revisions.unshift(pRevision);
		this.setState({
			revisions: this.state.revisions
		});
	}
	
	createNewRevision(prjId, comment){
			var _this = this;
        	ProjectEndpoint.createSnapshot(prjId, comment).then(function(resp) {
            	alertify.success("New revision has been created");
            	_this.addRevision(resp);
            	
	        }).catch(function(resp){
	        	alertify.error("New revision has not been created");
	    	});
    }
	
	requestValidationAccess(revId) {
		var projectEndpoint = new ProjectEndpoint();

		projectEndpoint.requestValidationAccess(revId)
			.then(
				function (val) {
					alertify.success("Request has been filed");
				})
			.catch(handleBadResponse);
	}
	
	deleteRevision(revisionId, index) {
		var _this = this;
		var projectEndpoint = new ProjectEndpoint();
		
		projectEndpoint.deleteRevision(revisionId)
			.then(
				function (val) {
					alertify.success("Revision has been deleted");
					_this.state.revisions.splice(index, 1);
					_this.setState({
						revisions: _this.state.revisions
					});
				})
			.catch(_this.handleBadResponse);
	}
	
	
	
	createReport(revId){
		var projectEndpoint = new ProjectEndpoint();
		DocumentsEndpoint.getDocuments(revId, "REVISION").then(function (documents) {
			var modal = new CustomForm('Create Validation Report');
			modal.addTextInput('title', "Report Title", '', '');
			var documentTitles = [];

			modal.addCheckBoxes('docs', documents);
			
			//TODO should not be hardcoded here
            var methods = ["f-measure", "krippendorffs-alpha", "cohens-kappa"];
            var units = ["paragraph", "sentence"];
            
            modal.addSelect("method", methods, "Evaluation Method");
            modal.addSelect("unit", units, "Unit of Coding");

			modal.showModal().then(function (data) {
				var selectedDocs = [];
				projectEndpoint.evaluateRevision(revId, data.title, data.docs, data.method, data.unit) //TODO
					.then(
						function (val) {
							alertify.success("Report Initiated. This may take a few minutes");
						})
					.catch(this.handleBadResponse);
			});
		});
	}
	
	handleBadResponse(reason) {
		alertify.error("There was an error");
		console.log(reason.message);
	}
	
	renderRevisionDeleteBtn(revision, index) {
		if (this.state.isAdmin || this.state.isProjectOwner) 
			return <a  onClick={() => this.deleteRevision(revision.id, index)} className="btn btn-danger btn-xs pull-right">
						Delete
					</a>;
		else return '';
	}
	
	
	renderReports (revId) {
		if (!this.state.reports[revId]) return '';
		var reports = this.state.reports[revId];

		return [
				<i key={'label_'+revId} className="fa fa-tachometer bg-grey">
				</i>,
				<div key={revId} className="timeline-item"> 
					<h3 className="timeline-header timelineUserName">
						<b> Reports </b> 
					</h3>
					<div className="timeline-body timelineContent">
						<ReportList reports={reports} isAdmin={this.state.isAdmin} isProjectOwner={this.state.isProjectOwner}/>
					</div>
				</div>
			];
	}
	
	renderCreateReportBtn(revId){
		const styles = this.getStyles();
		if (this.state.isAdmin || this.state.isProjectOwner) return <a onClick={() => this.createReport(revId)} className="btn btn-default btn-sm pull-right" style={styles.createReportBtn} >
			<i style={styles.btnIcon} className="fa fa-plus-circle  pull-left"></i>
						Create Report
		</a> 
		else return '';
	}
	
	renderValidationProjects (revId) {
		const styles = this.getStyles();
		
		if (!this.state.validationProjects[revId]) return '';
		var validationProjects = this.state.validationProjects[revId];

		return [
			<i key={'label_'+revId} className="fa fa-check bg-grey"></i>,
			<div key={revId} className="timeline-item"> 
				<h3 className="timeline-header timelineUserName">
					<b> Validation Projects </b> 
					{this.renderCreateReportBtn(revId)}
				</h3>
				<div className="timeline-body timelineContent">
					<ValPrjList validationProjects={validationProjects} isAdmin={this.state.isAdmin} isProjectOwner={this.state.isProjectOwner}/>
				</div>
			</div>
		];
	}
	

	render() {
		var _this = this;

		const styles = this.getStyles();

		//Render Components
		
		//Render Revision
		const renderRevisions = this.state.revisions.map((revision, index) => {
			return [
				<li key={'label_'+revision.id} className="time-label">
					<span className="bg-red timelineTime">
					{"Revision " + revision.revision}
					</span>
				</li>,
				<li key={revision.id}>
					<i className="fa fa-info bg-yellow"></i>
					<div className="timeline-item">
						<h3 className="timeline-header timelineUserName"><b> Revision Info </b> </h3>
						<div className="timeline-body timelineContent">
							{revision.comment}
						</div>
						<div className="timeline-footer">
							<a onClick={() => _this.requestValidationAccess(revision.id)} className="btn btn-info btn-xs ">Re-Code</a>
							{_this.renderRevisionDeleteBtn(revision, index)}
						</div>
					</div>
				</li>,
				<li>{_this.renderReports(revision.id)}</li>,
				<li>{_this.renderValidationProjects(revision.id)}</li>
				
				];
		});
		
		

		return (
			<div>
				<ul className="timeline list">
					{renderRevisions}
	            </ul>
     		</div>
		);
	}
}