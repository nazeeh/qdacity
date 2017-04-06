import 'script!../../common/ErrorHandler.js';
import Account from '../../common/Account.jsx';
import CustomForm from '../../common/modals/CustomForm';
import 'script!../../../../components/bootstrap/bootstrap.min.js'
import 'script!../../../../components/listJS/list.js';
import 'script!../../../../components/listJS/list.pagination.js';
import BinaryDecider from '../../common/modals/BinaryDecider.js';
import loadGAPIs from '../../common/GAPI';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';



import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();
		$('#welcomeName').html(account.getProfile().getGivenName());
		$('#welcome').removeClass('hidden');
		fillProjectsList();
		fillNotificationList();
	} else {
		$('#navAccount').hide();
	}
}

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();
	$("#textdocument-menu").collapse(); // editor will be initialized readonly, the toggle is later hooked to the visibility of the toolbar

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);


	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};


	document.getElementById('newPrjBtn').onclick = function () {
		showNewProjectModal();
	};

}

function createNewProject(name, description) {
	CodesystemEndpoint.insertCodeSystem(0, "PROJECT").then(function (codeSystem) {
		var project = {};
		project.codesystemID = codeSystem.id;
		project.maxCodingID = 0;
		project.name = name;
		project.description = description;
		ProjectEndpoint.insertProject(project).then(function (insertedProject) {
			codeSystem.project = insertedProject.id;

			CodesystemEndpoint.updateCodeSystem(codeSystem).then(function (updatedCodeSystem) {
				addProjectToProjectList(codeSystem.project, project.name, 'PROJECT');
			});
		});
	});
}

function acceptInvitation(notification) {

	ProjectEndpoint.addOwner(notification.project).then(function (resp) {});

	var requestData = {};
	requestData = notification;
	requestData.settled = true;

	UserEndpoint.updateUserNotification(requestData).then(function (resp) {
		fillNotificationList();
		fillProjectsList();
	});
}

function createValidationProject(notification) {
	var tmp = notification;
	ProjectEndpoint.createValidationProject(notification.project, notification.originUser).then(function (resp) {});

	settleNotification(notification);
}

function settleNotification(notification) {
	notification.settled = true;
	UserEndpoint.updateUserNotification(notification).then(function (resp) {
		fillNotificationList();
	});
}

function fillProjectsList() {
	$("#project-list").empty();

	var validationPrjPromise = ProjectEndpoint.listValidationProject();
	ProjectEndpoint.listProject().then(function (resp) {
		resp.items = resp.items || [];

		for (var i = 0; i < resp.items.length; i++) {
			var project_id = resp.items[i].id;
			var project_name = resp.items[i].name;

			addProjectToProjectList(project_id, project_name, 'PROJECT');
		}

		validationPrjPromise.then(addValidationProjects);

		var options = {
			valueNames: ['project_name', 'project_id'],
			page: 5,
			plugins: [ListPagination({})]
		};

		var projectList = new List('project-selection', options);
	});

}

function attachDeleteHandler() {
	$('.deletePrjBtn').click(function (e) {
		e.stopPropagation();
		var projectType = $(this).attr("prjType");
		var projectId = $(this).attr("prjId");
		switch (projectType) {
		case "PROJECT":
			deleteProject(projectId);
			break;
		case "VALIDATION":
			deleteValidationProject(projectId);
			break;
		default:
			break;
		}
	});

	$('.leavePrjBtn').click(function (e) {
		e.stopPropagation();
		var element = $(this);
		var decider = new BinaryDecider('Please confirm leaving this project', 'Cancel', 'Leave');
		decider.showModal().then(function (value) {
			if (value == 'optionB') {
				var projectType = element.attr("prjType");
				var projectId = element.attr("prjId");
				leaveProject(projectType, projectId);
			}
		});
	});

}

function addValidationProjects(resp) {
	resp.items = resp.items || [];

	for (var i = 0; i < resp.items.length; i++) {
		var project_id = resp.items[i].id;
		var project_name = resp.items[i].name;

		addProjectToProjectList(project_id, project_name, 'VALIDATION');
	}

	attachDeleteHandler(); // for both projects and validation projects

}

function fillNotificationList() {
	$("#notification-list").html("");
	UserEndpoint.listUserNotification().then(function (resp) {
		resp.items = resp.items || [];

		for (var i = 0; i < resp.items.length; i++) {
			var item = resp.items[i];
			switch (item.type) {
			case "INVITATION":
				addInvitationNotification(item);
				break;
			case "VALIDATION_REQUEST":
				addValidationRequestNotification(item);

				break;
			case "POSTED_VALIDATION_REQUEST":
				addPostedRequestNotification(item);

				break;
			case "VALIDATION_REQUEST_GRANTED":
				addRequestGrantedNotification(item);

				break;
			default:
				break;

			}
		}

		$('.notificationAccept').click(function () {
			var notificationString = $(this).attr("notification");
			var notificationObj = JSON.parse(notificationString);
			acceptInvitation(notificationObj);
		});


		bindNotificationBtns();

		var options = {
			valueNames: ['project_name', 'project_id', 'notification_date'],
			page: 5,
			plugins: [ListPagination({})]
		};

		var projectList = new List('notifications', options);
		projectList.sort('notification_date', {
			order: "desc"
		});
	});
}


function deleteProject(projectID) {
	ProjectEndpoint.removeProject(projectID).then(function (resp) {
		fillProjectsList();
	});
}

function deleteValidationProject(projectID) {
	ProjectEndpoint.removeValidationProject(projectID).then(function (resp) {
		fillProjectsList();
	});
}

function leaveProject(prjType, prjID) {
	ProjectEndpoint.removeUser(prjID, prjType).then(function (resp) {
		fillProjectsList();
	});
}

function addProjectToProjectList(projectID, projectName, projectType) {

	var html = '<li';
	if (projectType == 'VALIDATION') {
		html += ' class="clickable validationProjectItem" ';
		html += ' onclick="location.href = \'project-dashboard.html?project=' + projectID + '&type=VALIDATION\'">';
	} else {
		html += ' class="clickable" onclick="location.href = \'project-dashboard.html?project=' + projectID + '&type=PROJECT\'">';
	}


	html += '<span class="project_name">' + projectName + '</span>';
	html += '<span class="project_id hidden">' + projectID;
	html += '</span>';

	// Delete Project Btn
	if (projectType === "PROJECT") {
		html += '<a  prjId="' + projectID + '" prjType="' + projectType + '" class="deletePrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';
	}

	// Leave Project Btn
	html += '<a prjId="' + projectID + '" prjType="' + projectType + '"  class=" leavePrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
	html += '<i  class="fa fa-sign-out  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
	html += '</a>';

	// Coding Editor Btn
	if (projectType == 'PROJECT') html += '<a href="coding-editor.html?project=' + projectID + '" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	if (projectType == 'VALIDATION') html += '<a href="coding-editor.html?project=' + projectID + '&type=VALIDATION" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	html += ' <i class="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>';
	html += '<i  class="fa fa-pencil fa-stack-1x fa-inverse fa-editor-btn"></i>';
	html += '</a>';
	html += '</li>';
	$("#project-list").append(html);
}

function addInvitationNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name"> ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';

	if (notification.settled) {
		html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-15px; ">';
		html += '<i  class="fa fa-check fa-2x "></i>';
		html += '</a>';
	} else {
		//Reject Button
		html += '<a onclick="myAlert(' + notification.projectID + ')" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-22px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';
		//Accept Button
		html += '<a notification="' + JSON.stringify(notification).replace(/"/g, '&quot;') + '" class=" btn  fa-stack fa-lg notificationAccept" style="float:right; margin-top:-22px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>';
		html += '</a>';
	}

	html += '</li>';
	$("#notification-list").prepend(html);

}

function addValidationRequestNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name" > ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	if (notification.settled) {
		html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-20px; ">';
		html += '<i  class="fa fa-check fa-2x "></i>';
		html += '</a>';
	} else {
		notificationString = JSON.stringify(notification).replace(/"/g, '&quot;');
		//Reject Button
		html += '<a notificationString="' + notificationString + '" class=" settleNotificationBtn btn  fa-stack fa-lg" style="float:right; margin-top:-26px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';

		//Accept Button
		html += '<a notificationString="' + notificationString + '" class=" createValidationProjectBtn btn  fa-stack fa-lg" style="float:right; margin-top:-26px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>';
		html += '</a>';
	}

	html += '</li>';

	$("#notification-list").prepend(html);

}

function addPostedRequestNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name"> ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	html += '<a class=" fa-lg" style="color:grey; float:right; margin-top:-20px; ">';
	html += '<i  class="fa fa-key fa-2x "></i>';
	html += '</a>';


	html += '</li>';

	$("#notification-list").prepend(html);

}

function addRequestGrantedNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name" > ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-20px; ">';
	html += '<i  class="fa fa-key fa-2x "></i>';
	html += '</a>';


	html += '</li>';

	$("#notification-list").prepend(html);

}



function bindNotificationBtns() {
	$(".settleNotificationBtn").click(function () {
		var notificationString = $(this).attr("notificationString");
		settleNotification(JSON.parse(notificationString));
	});

	$(".createValidationProjectBtn").click(function () {
		var notificationString = $(this).attr("notificationString");
		createValidationProject(JSON.parse(notificationString));
	});
}

function myAlert(message) {
	window.alert(message);
}

function showNewProjectModal() {
	var modal = new CustomForm('Create a new project', '');
	modal.addTextInput('name', "Project Name", 'Name', '');
	modal.addTextField('desc', "Project Description", 'Description');
	modal.showModal().then(function (data) {
		createNewProject(data.name, data.desc);
	});
}