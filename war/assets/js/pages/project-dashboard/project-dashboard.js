import AgreementStats from './AgreementStats.jsx';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import Project from './Project';
import Account from '../../common/Account.jsx';
import TextField from '../../common/modals/TextField';
import loadGAPIs from '../../common/GAPI';

import RevisionHistory from "./RevisionHistory/RevisionHistory.jsx"
import Users from "./Users/Users.jsx"
import ProjectStats from "./ProjectStats.jsx"
import TitleRow from "./TitleRow/TitleRow.jsx"
import PersonalReportList from "./PersonalReportList.jsx"
import Description from "./Description.jsx";

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
var inviteUserField;
var projectStats;
var titleRow;
var description;

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		var userPromise = account.getCurrentUser();

		usersPanel = ReactDOM.render(<Users project={project} />, document.getElementById('user-section'));
		projectStats = ReactDOM.render(<ProjectStats  project={project} />, document.getElementById('projectStats'));
		titleRow = ReactDOM.render(<TitleRow project={project} account={account} />, document.getElementById('titleRow'));
		description = ReactDOM.render(<Description project={project} />, document.getElementById('projectDescription'));
		agreementCharts = ReactDOM.render(<AgreementStats  />, document.getElementById('agreementCharts'));
		setProjectProperties();
		if (project.getType() === 'PROJECT') {
			revisionHistory = ReactDOM.render(<RevisionHistory projectID={project.getId()} />, document.getElementById('revisionHistoryTimeline'));
			setRevisionHistory(userPromise);
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
	
	switch (projectType) {
	case 'PROJECT':
		$('#revisionHistory').show();
		break;
	case 'VALIDATION':
		$('#parentProject').show();
		$('#validationReports').show();
		break;
	default:
		break;
	}

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);

	document.getElementById('newRevisionBtn').onclick = function () {
		showNewRevisionModal("Revision Comment");
	}

}

function showNewRevisionModal(title) {
	var modal = new TextField(title, 'Use this field to describe this revision in a few sentences');
	modal.showModal().then(function (text) {
		revisionHistory.createNewRevision(project.getId(), text);
	});
}

function setProjectProperties() {
	ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
		description.setDescription(resp.description);
		project.setUmlEditorEnabled(resp.umlEditorEnabled);
		titleRow.setProjectProperties(resp);
		if (project.getType() === 'VALIDATION') {
			$('#parentProjectLink').attr('href', 'project-dashboard.html?project=' + resp.projectID + '&type=PROJECT');
			ReactDOM.render(<PersonalReportList projectType={project.getType()} project={resp} parentProject={resp.projectID} account={account} />, document.getElementById('personalReportList'));

		}
	});
}

function setRevisionHistory(userPromise) {
	var validationEndpoint = new ValidationEndpoint();

	var validationPromise = validationEndpoint.listReports(project.getId());

	ProjectEndpoint.listRevisions(project.getId()).then(function (resp) {
		userPromise.then(function (user) {
			resp.items = resp.items || [];
			var snapshots = [];
			var validationProjects = {};
			for (var i = 0; i < resp.items.length; i++) {
				if (resp.items[i].revisionID === undefined) snapshots.push(resp.items[i]);
				else {
					if (validationProjects[resp.items[i].revisionID] === undefined) validationProjects[resp.items[i].revisionID] = [];
					validationProjects[resp.items[i].revisionID].push(resp.items[i]);
				}
			}
			project.setRevisions(snapshots);
			project.setValidationProjects(validationProjects);


			validationPromise.then(function (reports) {

				for (var i = 0; i < snapshots.length; i++) {
					var revID = snapshots[i].id;
					if (typeof reports[revID] != 'undefined') {
						agreementCharts.addReports(reports[revID]);
					}
				}

				project.setReports(reports);

				revisionHistory.setRevisions(snapshots);
				revisionHistory.setValidationProjects(validationProjects);
				revisionHistory.setReports(reports);
				revisionHistory.setRights(project.getId(), user);

			});
		});

	});

}

function setBtnVisibility(userPromise) {
	userPromise.then(function (user) {

		var isProjectOwner = account.isProjectOwner(user, project.getId());
		usersPanel.setIsProjectOwner(isProjectOwner);
		description.setIsProjectOwner(isProjectOwner);
		titleRow.setIsProjectOwner(isProjectOwner);
		if (isProjectOwner) {
			$('#newRevisionBtn').removeClass('hidden');
		} else {
			$('#newRevisionBtn').addClass('hidden');
		}
	});
}