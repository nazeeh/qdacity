import AgreementStats from './AgreementStats';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import Project from './Project';
import Account from '../../common/Account.jsx';
import TextField from '../../common/modals/TextField';
import loadGAPIs from '../../common/GAPI';

import RevisionHistory from "./RevisionHistory/RevisionHistory.jsx"
import UserList from "./UserList.jsx"
import InviteUserField from "./InviteUserField.jsx"
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

var project_id;
var project_type;
var account;

var project;

var revisionHistory;
var userList;
var inviteUserField;
var projectStats;
var titleRow;
var description;

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		var userPromise = account.getCurrentUser();

		userList = ReactDOM.render(<UserList projectType={project_type}  projectId={project_id} />, document.getElementById('userList'));
		projectStats = ReactDOM.render(<ProjectStats  projectType={project_type} projectId={project_id} />, document.getElementById('projectStats'));
		inviteUserField = ReactDOM.render(<InviteUserField projectType={project_type} projectId={project_id} />, document.getElementById('inviteUserField'));
		titleRow = ReactDOM.render(<TitleRow projectType={project_type} projectId={project_id} account={account} />, document.getElementById('titleRow'));
		description = ReactDOM.render(<Description projectType={project_type} projectId={project_id} />, document.getElementById('projectDescription'));
		setProjectProperties();
		if (project_type === 'PROJECT') {
			revisionHistory = ReactDOM.render(<RevisionHistory projectID={project_id} />, document.getElementById('revisionHistoryTimeline'));
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

	project_id = urlParams.project;
	project_type = urlParams.type;
	project = new Project(urlParams.project, urlParams.type)
	if (typeof project_type === "undefined") project_type = 'PROJECT';
	switch (project_type) {
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
		revisionHistory.createNewRevision(project_id, text);
	});
}

function setProjectProperties() {
	ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
		description.setDescription(resp.description);
		project.setUmlEditorEnabled(resp.umlEditorEnabled);
		titleRow.setProjectProperties(resp);
		if (project_type === 'VALIDATION') {
			$('#parentProjectLink').attr('href', 'project-dashboard.html?project=' + resp.projectID + '&type=PROJECT');
			ReactDOM.render(<PersonalReportList projectType={project_type} project={resp} parentProject={resp.projectID} account={account} />, document.getElementById('personalReportList'));

		}
	});
}

function setRevisionHistory(userPromise) {
	var validationEndpoint = new ValidationEndpoint();

	var validationPromise = validationEndpoint.listReports(project_id);

	ProjectEndpoint.listRevisions(project_id).then(function (resp) {
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

				var agreementStats = new AgreementStats("agreementStats");

				for (var i = 0; i < snapshots.length; i++) {
					var revID = snapshots[i].id;
					if (typeof reports[revID] != 'undefined') {
						agreementStats.addReports(reports[revID]);
					}
				}

				project.setReports(reports);

				revisionHistory.setRevisions(snapshots);
				revisionHistory.setValidationProjects(validationProjects);
				revisionHistory.setReports(reports);
				revisionHistory.setRights(project_id, user);

			});
		});

	});

}

function setBtnVisibility(userPromise) {
	userPromise.then(function (user) {

		var isProjectOwner = account.isProjectOwner(user, project_id);
		inviteUserField.setIsProjectOwner(isProjectOwner);
		description.setIsProjectOwner(isProjectOwner);
		titleRow.setIsProjectOwner(isProjectOwner);
		if (isProjectOwner) {
			$('#newRevisionBtn').removeClass('hidden');
		} else {
			$('#newRevisionBtn').addClass('hidden');
		}
	});
}