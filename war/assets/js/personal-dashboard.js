import 'script!./ErrorHandler.js';
import 'script!./morris-data.js';
import Account from './Account';
import CustomForm from './modals/CustomForm';
import 'script!../../components/bootstrap/bootstrap.min.js'
import 'script!../../components/listJS/list.js';
import 'script!../../components/listJS/list.pagination.js';
import 'script!../../components/raphael/raphael-min.js';
import 'script!../../components/morrisjs/morris.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js', function() {
	$script('https://apis.google.com/js/platform.js?onload=init','google-api');
	});


var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';

var account;

function setupUI(){
	if (account.isSignedIn()){
		var profile = account.getProfile();
	    
	    document.getElementById('currentUserName').innerHTML = profile.getName();
		document.getElementById('currentUserEmail').innerHTML = profile.getEmail();
		document.getElementById('currentUserPicture').src = profile.getImageUrl();
		$('#navAccount').show();
		$('#navSignin').hide();
		
		fillProjectsList();
		fillNotificationList();
		createAreaChart();
		fillTaskBoard();
	}
	else{
		$('#navAccount').hide();
	}
}

function signout() {
	window.open("https://accounts.google.com/logout");
}


window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();
	$("#textdocument-menu").collapse(); // editor will be initialized readonly, the toggle is later hooked to the visibility of the toolbar

	var apisToLoad;
	var callback = function callback() {
		if (--apisToLoad == 0) {
			account = new Account(client_id, scopes);
			account.signin(setupUI);
		}
	};

	apisToLoad = 2;
	//Parameters are APIName,APIVersion,CallBack function,API Root
	//gapi.client.load('qdacity', 'v1', callback, 'https://localhost:8888/_ah/api');
	gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
	gapi.load('auth2', callback);


	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.signin(setupUI);
	};

	document.getElementById('navBtnSignOut').onclick = function () {
		signout();
	};

	document.getElementById('addToDoBtn').onclick = function () {
		createNewTask();
	};
	
	
	document.getElementById('navBtnSwitchAccount').onclick = function () {
		account.changeAccount(setupUI,client_id,scopes);
	};
	
	document.getElementById('newPrjBtn').onclick = function () {
		showNewProjectModal();
	};

	function createNewTask() {
		var task = {};

		var text = prompt("Describe task", "New Task");
		task.text = text;
		addTaskToList("#sortableToDo", task);
		updateTaskBoard();
	}
	
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

function addProjectToUser(projectID, notificationID, type, originUser, user, datetime, subject, message) {
	gapi.client.qdacity.project.addOwner({ 'projectID': projectID }).execute(function (resp) {
		if (!resp.code) {} else {
			window.alert(resp.code);
		}
	});

	var requestData = {};
	requestData.id = notificationID;
	requestData.project = projectID;
	requestData.type = type;
	requestData.originUser = originUser.toString();
	requestData.user = user.toString();
	requestData.settled = true;
	requestData.datetime = datetime;
	requestData.subject = subject;
	requestData.message = message;
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
				var id = resp.items[i].id;
				var datetime = resp.items[i].datetime;
				var user = resp.items[i].user;
				var originUser = resp.items[i].originUser;
				var type = resp.items[i].type;
				var project = resp.items[i].project;
				var subject = resp.items[i].subject;
				var message = resp.items[i].message;
				var settled = resp.items[i].settled;

				switch (type) {
					case "INVITATION":
						addInvitationNotification(id, project, subject, message, settled, type, originUser, user, datetime);
						break;
					case "VALIDATION_REQUEST":
						addValidationRequestNotification(resp.items[i]);

						break;
					default:
						break;

				}
			}
			
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

function fillTaskBoard() {
	$("#sortableToDo, #sortableInProgress, #sortableDone").html("");

	gapi.client.qdacity.user.getTaskboard().execute(function (resp) {
		if (!resp.code) {
			var todoList = resp.todo;
			var inProgressList = resp.inProgress;
			var doneList = resp.done;

			if (typeof todoList !== "undefined") {
				var dataArray = [];
				for (var i = 0; i < todoList.length; i++) {
					var task = todoList[i];
					addTaskToList("#sortableToDo", task);
				}
			}

			if (typeof inProgressList !== "undefined") {
				var dataArray = [];
				for (var i = 0; i < inProgressList.length; i++) {
					var task = inProgressList[i];
					addTaskToList("#sortableInProgress", task);
				}
			}

			if (typeof doneList !== "undefined") {
				var dataArray = [];
				for (var i = 0; i < doneList.length; i++) {
					var task = doneList[i];
					addTaskToList("#sortableDone", task);
				}
			}
		}
	});

	$("ul.droptrue").sortable({
		connectWith: "ul",
		update: function update() {
			updateTaskBoard();
		}
	});

	$("#sortableToDo, #sortableInProgress, #sortableDone").disableSelection();
}

function updateTaskBoard() {

	var requestData = {};
	requestData.id = 2; // FIXME fixed ID only for testing
	requestData.todo = getTaskList($("#sortableToDo").children());
	requestData.inProgress = getTaskList($("#sortableInProgress").children());
	requestData.done = getTaskList($("#sortableDone").children());

	gapi.client.qdacity.updateTaskBoard(requestData).execute(function (resp) {
		if (!resp.code) {}
	});
}

function getTaskList(taskItemList) {
	var taskList = [];
	for (var i = 0; i < taskItemList.length; i++) {
		var taskItem = taskItemList[i];

		var task = {};
		task.text = taskItem.innerHTML;
		taskList.push(task);
	}

	return taskList;
}

function addTaskToList(list, task) {
	var html = '<li class="ui-state-default taskitem" >';
	html += task.text;
	html += '</li>';

	$(list).append(html);
}

function createAreaChart() {
	$('#morris-area-chart').empty();  
	gapi.client.qdacity.changelog.listChangeStats({ 'filterType': "user" }).execute(function (resp) {
		if (!resp.code) {
			if (typeof resp.items != 'undefined') {
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
			}
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

function leaveProject(projectID) {
	gapi.client.qdacity.project.removeUser({ 'projectID': projectID }).execute(function (resp) {
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
	html += '<a  prjId="'+projectID+'" prjType="'+projectType+'" class="deletePrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
	html += '<i  class="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
	html += '</a>';

	// Leave Project Btn
	html += '<a href="" onclick="leaveProject(' + projectID + ')" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
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

	
	
}

function addInvitationNotification(notificationID, projectID, subject, message, settled, type, originUser, user, datetime) {

	var html = '<li>';
	html += '<span class="inviting_user">' + subject + '</span><br/>';
	html += '<span class="project_name" style="font-size:20px;"> ' + message + '</span>';
	html += '<span class="project_id hidden">' + projectID + '</span>';
	html += '<span class="notification_date hidden">' + datetime + '</span>';
	html += '<span class="notification_id hidden">' + notificationID + '</span>';

	if (settled) {
		html += '<a class=" fa-lg" style="color:green; float:right; margin-top:-15px; ">';
		html += '<i  class="fa fa-check fa-2x "></i>';
		html += '</a>';
	} else {
		//Reject Button
		html += '<a onclick="myAlert(' + projectID + ')" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-22px; ">';
		html += ' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		html += '<i  class="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		html += '</a>';
		//Accept Button
		html += '<a onclick="addProjectToUser(' + projectID + ',' + notificationID + ',\'' + type + '\',\'' + originUser + '\',\'' + user + '\',\'' + datetime + '\',\'' + subject + '\',\'' + message + '\')" class=" btn  fa-stack fa-lg" style="float:right; margin-top:-22px; ">';
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
	var modal = new CustomForm('Create a new project');
	modal.addTextInput('name', "Project Name", 'Name');
	modal.addTextField('desc', "Project Description", 'Description');
	modal.showModal().then(function(data) {
		createNewProject(data.name, data.desc);
	});
}