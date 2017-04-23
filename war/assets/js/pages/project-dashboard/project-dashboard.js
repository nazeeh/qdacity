import Timeline from './timeline';
import AgreementStats from './AgreementStats';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';
import ChangeLogEndpoint from '../../common/endpoints/ChangeLogEndpoint';
import ValidationEndpoint from '../../common/endpoints/ValidationEndpoint';
import Project from './Project';
import Account from '../../common/Account.jsx';
import TextField from '../../common/modals/TextField';
import Settings from '../../common/modals/Settings';
import IntercoderAgreement from '../../common/modals/IntercoderAgreement';
import IntercoderAgreementByDoc from '../../common/modals/IntercoderAgreementByDoc';
import CustomForm from '../../common/modals/CustomForm';
import DocumentsEndpoint from '../../common/endpoints/DocumentsEndpoint';
import loadGAPIs from '../../common/GAPI';

import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/listJS/list.js';
import 'script!../../../../components/listJS/list.pagination.js';
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

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		setGeneralStats();

		fillUserList();

		//createAreaChart();

		setProjectProperties();
		if (project_type === 'PROJECT') setRevisionHistory();

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

	document.getElementById('inviteUserBtn').onclick = function () {
		inviteUser();
	}

	document.getElementById('newRevisionBtn').onclick = function () {
		showNewRevisionModal("Revision Comment");
	}


	document.getElementById('editDescriptionBtn').onclick = function () {
		showDescriptionModal();
	};

}

function addProjectToUser() {

}

function setGeneralStats() {
	ProjectEndpoint.getProjectStats(project_id, project_type).then(function (resp) {
		$("#topStatsDocuments").html(resp.documentCount);
		$("#topStatsCodes").html(resp.codeCount);
		$("#topStatsCodings").html(resp.codingCount);
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

function showDocumentResults(reportID, parentProject) {
	ValidationEndpoint.getValidationResult(reportID, project_id).then(function (resp) {
		var agreementByDoc = new IntercoderAgreementByDoc(resp.id, project_id, project_id, project_type);
		agreementByDoc.showModal();
	});
}

function setRevisionHistory() {
	var validationEndpoint = new ValidationEndpoint();

	var userPromise = account.getCurrentUser();
	var validationPromise = validationEndpoint.listReports(project_id);

	ProjectEndpoint.listRevisions(project_id).then(function (resp) {
		userPromise.then(function (user) {

			$("#revision-timeline").empty();
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

			var timeline = new Timeline(user, project_id);


			validationPromise.then(function (reports) {
				var agreementStats = new AgreementStats("agreementStats");

				project.setReports(reports);
				for (var i = 0; i < snapshots.length; i++) {
					var revID = snapshots[i].id;
					timeline.addLabelToTimeline(snapshots[i].revision);
					timeline.addRevInfoToTimeline(snapshots[i], user);


					if (typeof reports[revID] != 'undefined') {
						timeline.addReportToTimeline(reports[revID]);
						agreementStats.addReports(reports[revID]);
					}


					var validationProjectList = validationProjects[revID];

					if (validationProjectList !== undefined) timeline.addValidationProjects(validationProjectList);
				}

				timeline.addToDom("#revision-timeline");

				if (account.isProjectOwner(user, project_id)) {
					$('#newRevisionBtn').removeClass('hidden');
					$('.deleteReportBtn').removeClass('hidden');
					$('.createReportBtn').removeClass('hidden');
					$('#codingEditorBtn').removeClass('hidden');
					$('#settingsBtn').removeClass('hidden');
					$('#editDescriptionBtn').removeClass('hidden');

					$('#inviteUser').removeClass('hidden');

					$('.report').addClass('reportLink');
				} else {
					$('.report').removeClass('reportLink');
					$('#newRevisionBtn').addClass('hidden');
					$('.deleteReportBtn').addClass('hidden');
					$('.createReportBtn').addClass('hidden');
					$('#codingEditorBtn').addClass('hidden');
					$('#settingsBtn').addClass('hidden');
					$('#editDescriptionBtn').addClass('hidden');
					$('#inviteUser').addClass('hidden');
				}

				if (project_type == "VALIDATION") {
					$('#codingEditorBtn').removeClass('hidden');
					$('#settingsBtn').removeClass('hidden');
				}


				$(".deleteRevisionBtn").click(function () {
					var revisionId = $(this).attr("revId");
					deleteRevision(revisionId);
				});

				$(".deleteValidationPrjBtn").click(function (event) {
					event.preventDefault();
					event.stopPropagation();
					var prjId = $(this).attr("prjId");
					deleteValidationProject(prjId);
				});

				$(".deleteReportBtn").click(function (event) {
					event.preventDefault();
					event.stopPropagation();
					var repId = $(this).attr("repId");
					deleteValidationReport(repId);
				});

				$(".reportLink").click(function (event) {
					var revId = $(this).attr("revId");
					var repId = $(this).attr("repId");
					showValidationReports(project.getReport(revId, repId));
				});

				$(".validationProjectLink").click(function () {
					var prjId = $(this).attr("prjId");
					window.location.href = 'coding-editor.html?project=' + prjId + '&type=VALIDATION';
				});

				$(".requestValidationAccessBtn").click(function () {
					var revId = $(this).attr("revId");
					requestValidationAccess(revId);
				});

				$(".createReportBtn").click(function (event) {
					event.preventDefault();
					var revId = $(this).attr("revId");
					var projectEndpoint = new ProjectEndpoint();
					DocumentsEndpoint.getDocuments(revId, "REVISION").then(function (documents) {
						var modal = new CustomForm('Create Validation Report');
						modal.addTextInput('title', "Report Title", '', '');
						var documentTitles = [];

						modal.addCheckBoxes('docs', documents);

						modal.showModal().then(function (data) {
							var selectedDocs = [];
							projectEndpoint.evaluateRevision(revId, data.title, data.docs)
								.then(
									function (val) {
										setRevisionHistory();
									})
								.catch(handleBadResponse);
						});
					});
				});

				//Create ListJS Lists (doing it here so all the click handlers are already applied)
				var elem = $('.validationPrjList');
				elem.each(function () {
					var options = {
						valueNames: ['project_name'],
						page: 10,
						plugins: [ListPagination({})]
					};
					var myList = new List(this, options);
				});

			});
		});

	});

}

function deleteRevision(revisionId) {

	var projectEndpoint = new ProjectEndpoint();

	projectEndpoint.deleteRevision(revisionId)
		.then(
			function (val) {
				alertify.success("Revision has been deleted");
				setRevisionHistory();
			})
		.catch(handleBadResponse);
}

function deleteValidationProject(prjId) {

	ProjectEndpoint.removeValidationProject(prjId)
		.then(
			function (val) {
				alertify.success("Revision has been deleted");
				setRevisionHistory();
			})
		.catch(handleBadResponse);
}

function deleteValidationReport(repId) {

	var validationEndpoint = new ValidationEndpoint();

	validationEndpoint.deleteReport(repId)
		.then(
			function (val) {
				alertify.success("Report has been deleted");
				setRevisionHistory();
			})
		.catch(handleBadResponse);
}

function requestValidationAccess(prjId) {
	var projectEndpoint = new ProjectEndpoint();

	projectEndpoint.requestValidationAccess(prjId)
		.then(
			function (val) {
				alertify.success("Request has been filed");
			})
		.catch(handleBadResponse);
}

function showValidationReports(report) {
	var agreementModal = new IntercoderAgreement(report);
	agreementModal.showModal();
}

function handleBadResponse(reason) {
	alertify.error("There was an error");
	console.log(reason.message);
}

function fillUserList() {
	$('#user-list').empty();
	switch (project_type) {
	case "VALIDATION":
		addValidationCoders();
		break;
	case "PROJECT":
		addOwners();
		break;
	default:
		break;

	}
}

function addOwners() {
	UserEndpoint.listUser(project_id).then(function (resp) {
		resp.items = resp.items || [];

		for (var i = 0; i < resp.items.length; i++) {
			var user_id = resp.items[i].id;
			var given_name = resp.items[i].givenName;
			var sur_name = resp.items[i].surName;

			addUserToUserList(user_id, given_name + " " + sur_name);
		}
		var options = {
			valueNames: ['user_name', 'user_id']
		};

		var projectList = new List('user-section', options);

	});
}

function addValidationCoders() {
	UserEndpoint.listValidationCoders(project_id).then(function (resp) {
		resp.items = resp.items || [];

		for (var i = 0; i < resp.items.length; i++) {
			var user_id = resp.items[i].id;
			var given_name = resp.items[i].givenName;
			var sur_name = resp.items[i].surName;

			addUserToUserList(user_id, given_name + " " + sur_name);
		}
		var options = {
			valueNames: ['user_name', 'user_id']
		};

		var projectList = new List('user-section', options);
	});
}

//FIXME Obsolete for now
function createAreaChart() {
	$('#morris-area-chart').empty();

	ChangeLogEndpoint.listChangeStats(project_id, project_type).then(function (resp) {
		var dataArray = [];
		for (var i = 0; i < resp.items.length; i++) {
			dataArray.push({
				period: resp.items[i].label,
				codesCreated: resp.items[i].codesCreated
			});
		}

		Morris.Area({
			element: 'morris-area-chart',
			data: dataArray,
			xkey: 'period',
			ykeys: ['codesCreated'],
			labels: ['Codes Created'],
			pointSize: 3,
			hideHover: 'auto',
			resize: true
		});
	});
}

function addUserToUserList(userID, userName) {

	var html = '<li>';

	html += '<span class="user_name">' + userName + '</span>';
	html += '<span class="user_id hidden">' + userID;
	html += '</span>';
	html += '</li>';
	$("#user-list").append(html);


}

function addReportToReportList(reportName, revisionID, reportID, dateTime) {


	var label = '<span class="reportName">' + reportName + '</span><span class="reportDate">[' + dateTime + ']</span>';
	var html = '<li class="studentReportLink listItem report" repId="' + reportID + '"  >' + label;
	html += '</li>'
	$("#reports-list").append(html);
}


function inviteUser() {

	var userEmail = document.getElementById("userEmailFld").value;

	ProjectEndpoint.inviteUser(project_id, userEmail).then(function (resp) {
		alertify.success(userEmail + " has been invited");
	}).catch(function (resp) {
		alertify.error(userEmail + " was not found");
	});
}

function createNewRevision(comment) {
	ProjectEndpoint.createSnapshot(project_id, comment).then(function (resp) {
		alertify.success("New revision has been created");
		setRevisionHistory();

	}).catch(function (resp) {
		alertify.error("New revision has not been created");
	});
}

function showNewRevisionModal(title) {
	var modal = new TextField(title, 'Use this field to describe this revision in a few sentences');
	modal.showModal().then(function (text) {
		createNewRevision(text);
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