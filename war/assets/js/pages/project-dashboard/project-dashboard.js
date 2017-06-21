import AgreementStats from './AgreementStats.jsx';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

import Project from './Project';
import Account from '../../common/Account.jsx';
import loadGAPIs from '../../common/GAPI';

import RevisionHistory from "./RevisionHistory/RevisionHistory.jsx"
import Users from "./Users/Users.jsx"
import ProjectStats from "./ProjectStats.jsx"
import TitleRow from "./TitleRow/TitleRow.jsx"
import PersonalReportList from "./PersonalReportList.jsx"
import Description from "./Description.jsx";
import ParentProject from "./ParentProject/ParentProject.jsx"

import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/URIjs/URI.min.js';
import 'script!../../../../components/alertify/alertify-0.3.js';
import 'script!../../../../components/AdminLTE/js/app.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://www.gstatic.com/charts/loader.js', function () { //load charts loader for google charts
		$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
	});

}

var account;

var project;
var agreementCharts;
var revisionHistory;
var usersPanel;
var projectStats;
var titleRow;
var description;

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		var userPromise = account.getCurrentUser();
		var projectPromise = ProjectEndpoint.getProject(project.getId(), project.getType());
		usersPanel = ReactDOM.render(<Users project={project} />, document.getElementById('user-section'));
		projectStats = ReactDOM.render(<ProjectStats  project={project} />, document.getElementById('projectStats'));
		titleRow = ReactDOM.render(<TitleRow project={project} account={account} />, document.getElementById('titleRow'));
		description = ReactDOM.render(<Description project={project} />, document.getElementById('projectDescription'));
		agreementCharts = ReactDOM.render(<AgreementStats  />, document.getElementById('agreementCharts'));
		
		setProjectProperties();
		if (project.getType() === 'PROJECT') {
			revisionHistory = ReactDOM.render(<RevisionHistory project={project}  agreementCharts={agreementCharts} userPromise={userPromise} />, document.getElementById('revisionHistory'));
			setBtnVisibility(userPromise); 
		}

	} else {
		$('#navAccount').hide();
		handleError(resp.code);
	}
}

window.init = function () {
	var urlParams = URI(window.location.search).query(true);

	var projectId = urlParams.project;
	var projectType = urlParams.type;
	if (typeof projectType === "undefined") projectType = 'PROJECT';
	project = new Project(urlParams.project, urlParams.type);

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}

function setProjectProperties() {
	ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
		description.setDescription(resp.description);
		project.setUmlEditorEnabled(resp.umlEditorEnabled);
		project.setParentID(resp.projectID); // Only present for ValidationProject
		project.setRevisionID(resp.revisionID); // Only present for ValidationProject
		titleRow.setProjectProperties(resp);
		ReactDOM.render(<ParentProject project={project} />, document.getElementById('parentProject'));
		ReactDOM.render(<PersonalReportList project={project} account={account} />, document.getElementById('personalReportList'));
	});
}

function setBtnVisibility(userPromise) {
	userPromise.then(function (user) {

		var isProjectOwner = account.isProjectOwner(user, project.getId());
		usersPanel.setIsProjectOwner(isProjectOwner);
		description.setIsProjectOwner(isProjectOwner);
		titleRow.setIsProjectOwner(isProjectOwner);
	});
}