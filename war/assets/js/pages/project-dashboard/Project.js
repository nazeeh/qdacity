export default class Project {
	constructor(prjId, type) {
		this.id = prjId;
		this.name = "";
		this.description = "";
		this.type = type;
		this.reports = {}; // hashmap indexed by revision ID
		this.revisions = [];
		this.validationProjects = {}; // list indexed by revision ID
		this.umlEditorEnabled = false;
		this.parentID = undefined; // when the project is a validationproject this points to the project it is based on
		this.revisionID = undefined;
		this.codesystemID = -1;
	}

	getId() {
		return this.id;
	}

	getType() {
		return this.type;
	}

	getName() {
		return this.name;
	}

	setName(name) {
		this.name = name;
	}

	getDescription() {
		return this.description;
	}

	setDescription(desc) {
		this.description = desc;
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

	getParentID() {
		return this.parentID;
	}

	setParentID(parentID) {
		this.parentID = parentID;
	}

	getCodesystemID() {
		return this.codesystemID;
	}

	setCodesystemID(codesystemID) {
		this.codesystemID = codesystemID;
	}

	getRevisionID() {
		return this.revisionID;
	}

	setRevisionID(revisionID) {
		this.revisionID = revisionID;
	}
}