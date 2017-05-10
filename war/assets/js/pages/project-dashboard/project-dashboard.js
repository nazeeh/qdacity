import AgreementStats from './AgreementStats';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';
import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import Project from './Project';
import Account from '../../common/Account.jsx';
import TextField from '../../common/modals/TextField';
import Settings from '../../common/modals/Settings';
import loadGAPIs from '../../common/GAPI';

import RevisionHistory from "./RevisionHistory/RevisionHistory.jsx"
import UserList from "./UserList.jsx"
import InviteUserField from "./InviteUserField.jsx"
import ProjectStats from "./ProjectStats.jsx"

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

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		var userPromise = account.getCurrentUser();
		
		userList = ReactDOM.render(<UserList projectType={project_type}  projectId={project_id} />, document.getElementById('userList'));
		projectStats = ReactDOM.render(<ProjectStats  projectType={project_type} projectId={project_id} />, document.getElementById('projectStats'));
		inviteUserField = ReactDOM.render(<InviteUserField projectType={project_type} projectId={project_id} />, document.getElementById('inviteUserField'));
		
		setProjectProperties();
		if (project_type === 'PROJECT'){
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
		$('#codingEditorBtn').removeClass('hidden');
		$('#settingsBtn').addClass('hidden');
		break;
	default:
		break;
	}

	$("#codingEditorBtn").click(function () {
		location.href = 'coding-editor.html?project=' + project_id + '&type=' + project_type;
	});

	$("#settingsBtn").click(function () {
		showSettingsModal();
	});

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);

	document.getElementById('editDescriptionBtn').onclick = function () {
		showDescriptionModal();
	};
	
	document.getElementById('newRevisionBtn').onclick = function() {
		showNewRevisionModal("Revision Comment");
    }

}

function showNewRevisionModal(title){
	var modal = new TextField(title, 'Use this field to describe this revision in a few sentences');
	modal.showModal().then(function(text) {
		revisionHistory.createNewRevision(project_id, text);
	});
}

function setProjectProperties() {
	ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
		$("#project-name").html(resp.name);
		$("#projectDescription").html(resp.description);
		project.setUmlEditorEnabled(resp.umlEditorEnabled);

		if (project_type === 'VALIDATION') {
			$('#parentProjectLink').attr('href', 'project-dashboard.html?project=' + resp.projectID + '&type=PROJECT');
			setReportList(resp.projectID);
		}
	});
}

function setReportList(parentProject) {
	var validationEndpoint = new ValidationEndpoint();
	var validationPromise = validationEndpoint.listReports(parentProject);
	//FIXME clear list on reload
	validationPromise.then(function (reports) {

		for (var property in reports) {
			if (reports.hasOwnProperty(property)) {
				var reportArr = reports[property];
				reportArr = reportArr || [];
				for (var i = 0; i < reportArr.length; i++) {
					var report = reportArr[i];
					addReportToReportList(report.name, report.revisionID, report.id, report.datetime);

				}
			}
		}
		$(".studentReportLink").click(function (event) {
			var repId = $(this).attr("repId");
			showDocumentResults(repId, parentProject);
		});

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
				
				project.setReports(reports);
				
				revisionHistory.setRevisions(snapshots);
				revisionHistory.setValidationProjects(validationProjects);
				revisionHistory.setReports(reports);
				revisionHistory.setRights(project_id, user);

			});
		});

	});

}

function setBtnVisibility(userPromise){
	userPromise.then(function (user) {
		
		var isProjectOwner = account.isProjectOwner(user, project_id);
		inviteUserField.setIsProjectOwner(isProjectOwner);
		
		if (isProjectOwner) {
			$('#codingEditorBtn').removeClass('hidden');
			$('#settingsBtn').removeClass('hidden');
			$('#editDescriptionBtn').removeClass('hidden');
			$('#newRevisionBtn').removeClass('hidden');
		} else {
			$('#codingEditorBtn').addClass('hidden');
			$('#settingsBtn').addClass('hidden');
			$('#editDescriptionBtn').addClass('hidden');
			$('#newRevisionBtn').addClass('hidden');
		}
	});
}

function showDescriptionModal() {
	var modal = new TextField('Change the project description', 'Description');
	modal.showModal().then(function (text) {
		ProjectEndpoint.setDescription(project_id, project_type, text).then(function (resp) {
			$("#projectDescription").html(text);
		});
	});
}

function showSettingsModal() {
	var modal = new Settings();

	modal.showModal(project.isUmlEditorEnabled()).then(function (data) {
		ProjectEndpoint.setUmlEditorEnabled(project_id, project_type, data.umlEditorEnabled).then(function (resp) {
			project.setUmlEditorEnabled(data.umlEditorEnabled);
		});
	});
}
