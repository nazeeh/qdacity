import 'script!./ErrorHandler.js';
import 'script!./morris-data.js';
import Account from './Account.jsx';
import CustomForm from './modals/CustomForm';
import 'script!../../components/bootstrap/bootstrap.min.js'
import 'script!../../components/listJS/list.js';
import 'script!../../components/listJS/list.pagination.js';
import 'script!../../components/raphael/raphael-min.js';
import 'script!../../components/morrisjs/morris.min.js';
import BinaryDecider from './modals/BinaryDecider.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function (){
	$script('https://apis.google.com/js/platform.js?onload=init','google-api');
}


var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';

var account;

function setupUI(){
	if (account.isSignedIn()){
		$('#navAccount').show();
		$('#navSignin').hide();
		$('#welcomeName').html(account.getProfile().getGivenName());
		$('#welcome').removeClass('hidden');
		fillProjectsList();
		fillNotificationList();
	}
	else{
		$('#navAccount').hide();
	}
}

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();
	$("#textdocument-menu").collapse(); // editor will be initialized readonly, the toggle is later hooked to the visibility of the toolbar

	var apisToLoad;
	var callback = function callback() {
		if (--apisToLoad == 0) {
			account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={setupUI}/>, document.getElementById('accountView'));
		}
	};

	apisToLoad = 2;
	//Parameters are APIName,APIVersion,CallBack function,API Root
	//gapi.client.load('qdacity', 'v1', callback, 'https://localhost:8888/_ah/api');
	gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
	gapi.load('auth2', callback);


	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};

	
	document.getElementById('newPrjBtn').onclick = function () {
		showNewProjectModal();
	};
	
}

function createNewProject(name, description) {

	var requestData = {};
	requestData.project = 0;
	requestData.projectType = "PROJECT";

	gapi.client.qdacity.codesystem.insertCodeSystem(requestData).execute(function (resp) {
		if (!resp.code) { 

			var requestData2 = {};
			requestData2.codesystemID = resp.id;
			requestData2.maxCodingID = 0;
			requestData2.name = name;
			requestData2.description = description;
			gapi.client.qdacity.project.insertProject(requestData2).execute(function (resp2) {
				if (!resp2.code) {
					requestData.id = resp.id;
					requestData.project = resp2.id;

					gapi.client.qdacity.codesystem.updateCodeSystem(requestData).execute(function (resp3) {
						if (!resp3.code) {
							addProjectToProjectList(requestData.project, requestData2.name, 'PROJECT');
						}
					});
				} else {
					window.alert(resp.code);
				}
			});
		} else {
			window.alert(resp.code);
		}
	});
}

function acceptInvitation(notification) {
	
	gapi.client.qdacity.project.addOwner({ 'projectID': notification.project }).execute(function (resp) {
		if (!resp.code) {} else {
			window.alert(resp.code);
		}
	});

	var requestData = {};
	requestData = notification;
	requestData.settled = true;
	
	gapi.client.qdacity.user.updateUserNotification(requestData).execute(function (resp) {
		if (!resp.code) {
			fillNotificationList();
			fillProjectsList();
		} else {
			window.alert(resp.code);
		}
	});
}

function createValidationProject(notification) {
	var tmp = notification;
	gapi.client.qdacity.project.createValidationProject({ 'projectID': notification.project, 'userID': notification.originUser }).execute(function (resp) {
		if (!resp.code) {} else {
			window.alert(resp.code);
		}
	});

	settleNotification(notification);
}

function settleNotification(notification) {
	notification.settled = true;
	gapi.client.qdacity.user.updateUserNotification(notification).execute(function (resp) {
		if (!resp.code) {
			fillNotificationList();
		} else {
			window.alert(resp.code);
		}
	});
}

function fillProjectsList() {
	$("#project-list").empty();
	
	gapi.client.qdacity.project.listProject().execute(function (resp) {
		if (!resp.code) {
			resp.items = resp.items || [];

			for (var i = 0; i < resp.items.length; i++) {
				var project_id = resp.items[i].id;
				var project_name = resp.items[i].name;

				addProjectToProjectList(project_id, project_name, 'PROJECT');
			}
			addValidationProjects();
			
			attachDeleteHandler();
			
			var options = {
				valueNames: ['project_name', 'project_id'],
				page: 5,
				plugins: [ListPagination({})]
			};

			var projectList = new List('project-selection', options);
		} else {
			window.alert(resp.code);
		}
	});
	
}

function attachDeleteHandler(){
	$('.deletePrjBtn').click(function(e) {
		e.stopPropagation();
		var projectType = $( this ).attr("prjType");
    	var projectId = $( this ).attr("prjId");
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

	$('.leavePrjBtn').click(function(e) {
		e.stopPropagation();
		var element = $(this);
		var decider = new BinaryDecider('Please confirm leaving this project',  'Cancel', 'Leave' );
		  decider.showModal().then(function(value){
			  if (value == 'optionB'){
				var projectType = element.attr("prjType");
    	        var projectId = element.attr("prjId");
    	        leaveProject(projectType, projectId);
			  }
		  });
    });
	
}

function addValidationProjects(){
	gapi.client.qdacity.project.listValidationProject().execute(function (resp) {
		if (!resp.code) {
			resp.items = resp.items || [];

			for (var i = 0; i < resp.items.length; i++) {
				var project_id = resp.items[i].id;
				var project_name = resp.items[i].name;

				addProjectToProjectList(project_id, project_name, 'VALIDATION');
			}
		} else {
			window.alert(resp.code);
		}
	});
}

function fillNotificationList() {
	$("#notification-list").html("");
	gapi.client.qdacity.user.listUserNotification().execute(function (resp) {
		if (!resp.code) {
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
			
			$('.notificationAccept').click(function() {
				var notificationString = $( this ).attr("notification");
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
			projectList.sort('notification_date', { order: "desc" });
		} else {
			window.alert(resp.code);
		}
	});
}


function deleteProject(projectID) {
	gapi.client.qdacity.project.removeProject({ 'id': projectID }).execute(function (resp) {
		if (!resp.code) {
			fillProjectsList();
		}
	});
}

function deleteValidationProject(projectID) {
	gapi.client.qdacity.project.removeValidationProject({ 'id': projectID }).execute(function (resp) {
		if (!resp.code) {
			fillProjectsList();
		}
	});
}

function leaveProject(prjType, prjID) {
	gapi.client.qdacity.project.removeUser({ 'projectID': prjID }).execute(function (resp) {
		if (!resp.code) {
			fillProjectsList();
		}
	});
}

function addProjectToProjectList(projectID, projectName, projectType) {

	var html = '<li';
	if (projectType=='VALIDATION'){
		html +=	' class="validationProjectItem" ';
		html +=	' onclick="location.href = \'project-dashboard.html?project=' + projectID + '&type=VALIDATION\'">'; 
	}
	else {
		html +=	' onclick="location.href = \'project-dashboard.html?project=' + projectID + '&type=PROJECT\'">'; 
	}
	

	html += '<span class="project_name">' + projectName + '</span>';
	html += '<span class="project_id hidden">' + projectID;
	html += '</span>';

	// Delete Project Btn
	if (projectType === "PROJECT"){
		html += '<a  prjId="'+projectID+'" prjType="'+projectType+'" class="deletePrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';
	}

	// Leave Project Btn
	html += '<a prjId="'+projectID+'" prjType="'+projectType+'"  class=" leavePrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
	html += '<i  class="fa fa-sign-out  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
	html += '</a>';

	// Coding Editor Btn
	if (projectType=='PROJECT') html += '<a href="coding-editor.html?project=' + projectID + '" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	if (projectType=='VALIDATION') html += '<a href="coding-editor.html?project=' + projectID + '&type=VALIDATION" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	html += ' <i class="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>';
	html += '<i  class="fa fa-pencil fa-stack-1x fa-inverse fa-editor-btn"></i>';
	html += '</a>';
	html += '</li>';
	$("#project-list").append(html);
}

function addInvitationNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name" style="font-size:20px;"> ' + notification.message + '</span>';
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
		html += '<a notification="'+JSON.stringify(notification).replace(/"/g, '&quot;')+'" class=" btn  fa-stack fa-lg notificationAccept" style="float:right; margin-top:-22px; ">';
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
	html += '<span class="project_name" style="font-size:20px;"> ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	if (notification.settled) {
		html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-15px; ">';
		html += '<i  class="fa fa-check fa-2x "></i>';
		html += '</a>';
	} else {
		notificationString = JSON.stringify(notification).replace(/"/g, '&quot;');
		//Reject Button
		html += '<a notificationString="'+notificationString+'" class=" settleNotificationBtn btn  fa-stack fa-lg" style="float:right; margin-top:-22px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';
		
		//Accept Button
		html += '<a notificationString="' + notificationString + '" class=" createValidationProjectBtn btn  fa-stack fa-lg" style="float:right; margin-top:-22px; ">';
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
	html += '<span class="project_name" style="font-size:20px;"> ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	html += '<a class=" fa-lg" style="color:grey; float:right; margin-top:-15px; ">';
	html += '<i  class="fa fa-key fa-2x "></i>';
	html += '</a>';


	html += '</li>';
	
	$("#notification-list").prepend(html);
	
}

function addRequestGrantedNotification(notification) {

	var html = '<li>';
	html += '<span class="inviting_user">' + notification.subject + '</span><br/>';
	html += '<span class="project_name" style="font-size:20px;"> ' + notification.message + '</span>';
	html += '<span class="project_id hidden">' + notification.projectID + '</span>';
	html += '<span class="notification_date hidden">' + notification.datetime + '</span>';
	html += '<span class="notification_id hidden">' + notification.notificationID + '</span>';
	var notificationString = "";

	html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-15px; ">';
	html += '<i  class="fa fa-key fa-2x "></i>';
	html += '</a>';


	html += '</li>';
	
	$("#notification-list").prepend(html);
	
}



function bindNotificationBtns(){
	$( ".settleNotificationBtn" ).click(function() {
		var notificationString = $( this ).attr("notificationString");
		settleNotification(JSON.parse(notificationString));
    });
	
	$( ".createValidationProjectBtn" ).click(function() {
		var notificationString = $( this ).attr("notificationString");
		createValidationProject(JSON.parse(notificationString));
    });
}

function myAlert(message) {
	window.alert(message);
}

function showNewProjectModal(){
	var modal = new CustomForm('Create a new project','');
	modal.addTextInput('name', "Project Name", 'Name','');
	modal.addTextField('desc', "Project Description", 'Description');
	modal.showModal().then(function(data) {
		createNewProject(data.name, data.desc);
	});
}