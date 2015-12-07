var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
    var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
    
    var project_id;
	    
     function signin(mode, callback) {
   	  gapi.auth.authorize({client_id: client_id,scope: scopes, immediate: mode},callback);
   }
   
   function signout(){
   	window.open("https://accounts.google.com/logout");
   }
   
   function handleAuth() {

   	
		  var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
		    if (!resp.code) {
		      current_user_name = resp.given_name;
		      current_user_id = resp.id;
		      //window.alert(resp.id);
		      document.getElementById('currentUserName').innerHTML = resp.name;
		      document.getElementById('currentUserEmail').innerHTML = resp.email;
		      document.getElementById('currentUserPicture').src = resp.picture;
		      $('#navAccount').show();
		      $('#navSignin').hide();
		      // INIT
		      
		      setGeneralStats();
		      
		      fillUserList();
		      
		      createAreaChart();
		      
		    }
		    else {
		    	 $('#navAccount').hide();
		    	 handleError(resp.code);
		    }
		  });
		}
   
        function init() {
        	
        	var query = window.location.search;
      	  // Skip the leading ?, which should always be there,
      	  // but be careful anyway
      	  if (query.substring(0, 1) == '?') {
      	    query = query.substring(1);
      	  }
      	  var data = query.split(',');
      	  for (i = 0; (i < data.length); i++) {
      	    data[i] = unescape(data[i]);
      	  }
      	  project_id = data[0];
        	
        	
        	var query = window.location.search;
        	  // Skip the leading ?, which should always be there,
        	  // but be careful anyway
        	  if (query.substring(0, 1) == '?') {
        	    query = query.substring(1);
        	  }
        	  var data = query.split(',');
        	  for (i = 0; (i < data.length); i++) {
        	    data[i] = unescape(data[i]);
        	  }
        	  project_id = data[0];
        	  
        	  $(".codeEditorLink").attr('href','apitest.html?'+project_id);
        	  
        	var apisToLoad;
        	 var callback = function() {
        	   if (--apisToLoad == 0) {
        		   signin(true,handleAuth);
        		  
        	     //Load project settings
        	     
        	   }
        	   
        	}
        	  
        	apisToLoad = 2;
        	//Parameters are APIName,APIVersion,CallBack function,API Root 
        	//gapi.client.load('qdacity', 'v1', callback, 'https://localhost:8888/_ah/api');
        	gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
        	gapi.client.load('oauth2','v2',callback);

        	
			document.getElementById('navBtnSigninGoogle').onclick = function() {
				signin(false, handleAuth);
           	}  
				
			document.getElementById('navBtnSignOut').onclick = function() {
				signout();
           	}  
                
			document.getElementById('inviteUserBtn').onclick = function() {
                inviteUser();
            }
        }
        
        $(document).ready( function () {
        	//window.alert("test");
        	$( "#newProjectForm" ).on( "submit",function(event) {
        		event.preventDefault();	
        		createNewProject();
              });
        	
        });

        function createNewProject(){
        	
        	var requestData = {};
            requestData.project = 0;
            
            gapi.client.qdacity.codesystem.insertCodeSystem(requestData).execute(function(resp) {
                    if (!resp.code) {
                    	
                    	var requestData2 = {};
                        requestData2.codesystemID = resp.id;
                        requestData2.maxCodingID = 0;
                        requestData2.name = document.getElementById("newProjectName" ).value;
                        gapi.client.qdacity.project.insertProject(requestData2).execute(function(resp2) {
                                if (!resp2.code) {
                                	requestData.id = resp.id;
                                	requestData.project = resp2.id
                                	
                                	gapi.client.qdacity.codesystem.updateCodeSystem(requestData).execute(function(resp3) {
                                        if (!resp3.code) {
                                        	addUserToUserList(requestData.project, requestData2.name);
                                        }
                                	});
                                }
                                else{
                                	window.alert(resp.code);
                                }
                        });
                    }
                    else{
                    	window.alert(resp.code);
                    }
            });
        }

        function addProjectToUser(){
        	
        }

        function setGeneralStats(){
        	
        	gapi.client.qdacity.project.getProjectStats({'id': project_id}).execute(function(resp) {
        	   	 if (!resp.code) {
        	   		$("#topStatsDocuments").html(resp.documentCount);
        	   		$("#topStatsCodes").html(resp.codeCount);
        	   		$("#topStatsCodings").html(resp.codingCount);
        	        
        	   	 }
        	   
        	   	 else{
        	   		 window.alert(resp.code)
        	   	}
        	   	 
        	    });
        	
        }

        function fillUserList(){
        	gapi.client.qdacity.user.listUser({'projectID': project_id}).execute(function(resp) {
           	 if (!resp.code) {
           		resp.items = resp.items || [];
                
                for (var i=0;i<resp.items.length;i++) {
                        var user_id = resp.items[i].id;
                        var given_name = resp.items[i].givenName;
                        var sur_name = resp.items[i].surName;
                        
                  		addUserToUserList(user_id, given_name + " " + sur_name);
                }
                var options = {
                	  valueNames: [ 'user_name', 'user_id' ]
                };

                var projectList = new List('user-section', options);

                
           	 }
           
           	 else{
           		 window.alert(resp.code)
           	}
           	 
            });
        	
        }

        function createAreaChart(){
        	 gapi.client.qdacity.changelog.listChangeStats({'filterType': "project", 'projectID' : 1}).execute(function(resp){
        			if (!resp.code) {
        				var dataArray =  []; 
        				for (var i=0;i<resp.items.length;i++) {
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
        		});
        	
        }

        function addUserToUserList(userID, userName){

        	var html = '<li>';

        	html += '<span class="user_name">'+userName+'</span>';
        	html += '<span class="user_id hidden">'+userID;
        	html += '</span>';
        	html += '</li>';
        	$("#user-list").append(html);
        	
        	
        }
        function inviteUser(){
        	
        	var userEmail = document.getElementById("userEmailFld" ).value;
        	
        	gapi.client.qdacity.project.inviteUser({'projectID' : project_id, 'userEmail': userEmail}).execute(function(resp){
        		if (!resp.code) {
        			alertify.success(userEmail + " has been invited");
        		}
        		else{
        			alertify.error(userEmail + " was not found");
        			console.log(resp.code);
        		}
        	});
        }