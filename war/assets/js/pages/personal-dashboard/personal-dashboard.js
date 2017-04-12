import 'script!../../common/ErrorHandler.js';
import Account from '../../common/Account.jsx';

import 'script!../../../../components/bootstrap/bootstrap.min.js'
import BinaryDecider from '../../common/modals/BinaryDecider.js';
import loadGAPIs from '../../common/GAPI';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';

import ProjectList from "./ProjectList.jsx"



import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;
var projectList;

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();
		$('#welcomeName').html(account.getProfile().getGivenName());
		$('#welcome').removeClass('hidden');
		fillNotificationList();

		projectList.init();
	} else {
		$('#navAccount').hide();
	}
}

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();

	projectList = ReactDOM.render(<ProjectList />, document.getElementById('projectList'));

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);


	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};

}


function acceptInvitation(notification) {

	ProjectEndpoint.addOwner(notification.project).then(function (resp) {
		projectList.addProject(resp);
	});

	var requestData = {};
	requestData = notification;
	requestData.settled = true;

	UserEndpoint.updateUserNotification(requestData).then(function (resp) {
		fillNotificationList();
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