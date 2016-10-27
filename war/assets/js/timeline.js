export default class Timeline {
  constructor(user, prjId) {
	  
	this.isAdmin = user.type === "ADMIN";
	this.isProjectOwner = user.projects.indexOf(prjId) !== -1;
	this.user = user;
    this.html = "";
    this.revisionCount = 0;
  }
  
  getHTML(){
	  return this.html;
  }

  addRevInfoToTimeline(revision){
	  
  	 this.html += '<li>';
  		 this.html += '<i class="fa fa-info bg-yellow"></i>';
  		 this.html += '<span class="timelineType" style="display:none;">done</span>';
  		this.html += '<div class="timeline-item">';
  		this.html += ' <h3 class="timeline-header timelineUserName"><b> Revision Info </b> </h3>';

  		this.html += '<div class="timeline-body timelineContent">';
  		this.html += revision.comment;

  		this.html += '</div>';
  		this.html += '<div class="timeline-footer">';
  		this.html += '<a revId="'+revision.id+'" class="requestValidationAccessBtn btn btn-info btn-xs ">Re-Code</a>';
  		if (this.isAdmin || this.isProjectOwner) this.html += '<a revId="'+revision.id+'" class="deleteRevisionBtn btn btn-danger btn-xs pull-right">Delete</a>';
  		this.html += ' </div>';
  		this.html += '</div>';
  		this.html += '</li>';
   }
   
   addLabelToTimeline(label){
  	this.html += '<li class="time-label">';
  	this.html += '<span class="timelineType" style="display:none;">label</span>';
  	this.html += '<span class="bg-red timelineTime">';
  	this.html += "Revision " +label;
  	this.html += '</span>';
  	this.html += '</li>';
   }
   
   addValidationProjects(validationProjects){
	this.html += '<li>';
	this.html += '<i class="fa fa-check bg-grey"></i>';
	this.html += '<span class="timelineType" style="display:none;">done</span>';
	this.html += '<div class="timeline-item">';
	
	this.html += ' <h3 class="timeline-header timelineUserName"><b> Validation Projects </b> ';
	this.html += '<a revId="'+validationProjects[0].revisionID+'" class="createReportBtn btn  btn-default btn-sm pull-right" style="margin-top:-6px;   padding: 5px 10px;" href="#">';
	this.html += '<i style="font-size: 18px;" class="fa fa-plus-circle  pull-left"></i>';
	this.html += 'Create Report';
	this.html += '</a> </h3>';
	
	this.html += '<div id="validationPrjList'+this.revisionCount++ +'" class="timeline-body timelineContent validationPrjList">'; //list.js needs an (any) id for the div 
	
	this.html += '<span class="searchfield" id="searchform'+this.revisionCount++ +'"  style="width: 100%; float:none;"> <input type="text" class="search" placeholder="Search" />';
	this.html += '<button type="button" id="search">Find!</button>';
	this.html += '</span>';
		
	this.html += '<ul id="validation-project-list" class="list compactBoxList">';
		
	for (var i=0;i<validationProjects.length;i++) {
		this.html += this.addValidationProjectItem(validationProjects[i]);
	}
	   
	this.html += '</ul>';
	this.html += '<ul class="pagination"></ul>';
	this.html += '</div>';
	this.html += '</div>';
	   
	this.html += '</li>';
   }
   
   addValidationProjectItem(validationProject){
	   var itemHTML = "";
	   var isValidationCoder = validationProject.validationCoders.indexOf(this.user.id) != -1;
	   
	   var linkToProject = isValidationCoder || this.isProjectOwner || this.isAdmin;
	   if (linkToProject){
		   itemHTML = '<li class="validationProjectListItem validationProjectLink" prjId="'+validationProject.id+'"  ><span class="project_name">'+validationProject.creatorName+'</span><span class="project_id hidden">'+validationProject.id+'</span>';
	   } else itemHTML = '<li class="" ><span class="project_name">'+validationProject.creatorName+'</span><span class="project_id hidden">'+validationProject.id+'</span>';
	   
	   // Delete Project Btn if the user is admin, or owner of the project
	   var showDeleteBtn = this.isAdmin || this.isProjectOwner;
	   if (showDeleteBtn){
		   itemHTML +='<a href="" prjId="'+validationProject.id+'" class="deleteValidationPrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-18px; ">';
		   itemHTML +='<i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
		   itemHTML +='<i  class="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
		   itemHTML +='</a>';
	   }
	   itemHTML += '</li>'
	   
	   return itemHTML;
   }
   
   addReportToTimeline(reports){
	   this.html += '<li>';
	   this.html += '<i class="fa fa-tachometer bg-grey"></i>';
		 this.html += '<span class="timelineType" style="display:none;">done</span>';
		this.html += '<div class="timeline-item">';
		
		this.html += ' <h3 class="timeline-header timelineUserName"><b> Reports </b> ';
		this.html += '</h3>';
		
		this.html += '<div id="validationReportList'+this.revisionCount++ +'" class="timeline-body timelineContent validationPrjList">'; //list.js needs an (any) id for the div 
			
		this.html += '<ul id="validation-report-list" class="list compactBoxList">';
	   for (var i=0;i<reports.length;i++) {
		   
		   this.html += this.addValidationReportItem(reports[i]);
       }
	   
	   this.html += '</ul>';
	   this.html += '<ul class="pagination"></ul>';
	   this.html += '</div>';
 		this.html += '</div>';
	   
	   this.html += '</li>';
   }
   
   addValidationReportItem(report){
	   var itemHTML = "";
	   
	   itemHTML = '<li class="validationReportListItem" revId="'+report.revisionID+'" repId="'+report.id+'"  ><span class="project_name">'+report.id +'</span>';
	   itemHTML += '</li>'
	   
	   return itemHTML;
   }
   
   addToDom(selector){
	   $(selector).append(this.html);
	   
	   var lists = [];
	   var elem = $('.validationPrjList');
	   elem.each(function() {
		   var options = {
					valueNames: ['project_name'],
					page: 10,
					plugins: [ListPagination({})]
				};
		   var myList = new List( this, options);
		   lists.push();
	   });
   }
}

 