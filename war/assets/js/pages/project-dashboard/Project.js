export default class Project {
	constructor(prjId, type) {
		this.id = prjId;
		this.type = type;
		this.reports = {}; // hashmap indexed by revision ID
		this.revisions = [];
		this.validationProjects = {}; // list indexed by revision ID
		this.umlEditorEnabled = false;
		this.parentID = undefined; // when the project is a validationproject this points to the project it is based on
	}

	getId() {
		return this.id;
	}

	getType() {
		return this.type;
	}

	setRevisions(revs) {
		this.revisions = revs;
	}

	getReportsForRevision(revID) {
		return this.reports[revID];
	}

	getReport(revID, reportID) {
		var reports = this.reports[revID];

		var report = reports.find(function (report) {
			return report.id == reportID;
		});

		return report;

	}

	setReports(reports) {
		this.reports = reports;
	}

	setValidationProjects(prjList) {
		this.validationProjects = prjList;
	}

	getValidationProject(revId) {
		return this.validationProjects[revId];

	}

	addRevision(rev) {
		this.revisions.push(rev);
	}

	getRevisions() {
		return this.revisions;
	}

	findRevision(id) {
		return this.revisions.id === id;
	}

	getRevision(revID) {
		return this.revisions.find((x) => x.id === revID);
	}

	setUmlEditorEnabled(umlEditorEnabled) {
		this.umlEditorEnabled = umlEditorEnabled;
	}

	isUmlEditorEnabled() {
		return this.umlEditorEnabled;
	}
	
	getParentID(){
		return this.parentID;
	}
	
	setParentID(parentID){
		this.parentID = parentID;
	}
}