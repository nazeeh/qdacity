export default class Timeline {
  constructor() {

    this.html = "";
  
  }
  
  getHTML(){
	  return this.html;
  }

  addRevInfoToTimeline(comment, revID){
  	 
  	 this.html += '<li>';
  		 this.html += '<i class="fa fa-info bg-yellow"></i>';
  		 this.html += '<span class="timelineType" style="display:none;">done</span>';
  		this.html += '<div class="timeline-item">';
  		this.html += ' <h3 class="timeline-header timelineUserName"><b> Revision Info </b> </h3>';

  		this.html += '<div class="timeline-body timelineContent">';
  		this.html += comment;

  		this.html += '</div>';
  		this.html += '<div class="timeline-footer">';
  		this.html += '<a revId="'+revID+'" class="requestValidationAccessBtn btn btn-info btn-xs ">Re-Code</a>';
  		this.html += '<a revId="'+revID+'" class="deleteRevisionBtn btn btn-danger btn-xs pull-right">Delete</a>';
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
	   this.html += '<i class="fa fa-check bg-green"></i>';
		 this.html += '<span class="timelineType" style="display:none;">done</span>';
		this.html += '<div class="timeline-item">';
		
		this.html += ' <h3 class="timeline-header timelineUserName"><b> Validation Projects </b> ';
		//this.html += '<div class="timeline-body timelineContent">';style="font-size: 18px;"
		this.html += '<a revId="'+validationProjects[0].revisionID+'" class=" validateRevisionBtn btn  btn-default btn-sm pull-right" style="margin-top:-6px;   padding: 5px 10px;" href="#">';
		this.html += '<i style="margin-top:-2px; font-size: 18px;" class="fa fa-tachometer pull-left"></i>';
		this.html += 'Calculate Agreement';
		this.html += '</a> </h3>';
		//this.html += '</div>';
		
		this.html += '<div class="timeline-body timelineContent">';
		
	   for (var i=0;i<validationProjects.length;i++) {
		   this.html += '<ul id="validation-project-list" class="list compactBoxList">';
		   this.html += this.addValidationProjectItem(validationProjects[i]);
		   this.html += '</ul>';
       }
	   
	   this.html += '</div>';
 		this.html += '</div>';
	   
	   this.html += '</li>';
   }
   
   addValidationProjectItem(validationProject){
	   var itemHTML = "";
	   itemHTML = '<li class="validationProjectListItem" prjId="'+validationProject.id+'" ><span class="project_name">'+validationProject.creatorName+'</span><span class="project_id hidden">'+validationProject.id+'</span>';
	   	// Delete Project Btn
	   itemHTML +='<a href="" prjId="'+validationProject.id+'" class="deleteValidationPrjBtn btn  fa-stack fa-lg" style="float:right; margin-top:-15px; ">';
	   itemHTML +=' <i class="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>';
	   itemHTML +='<i  class="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>';
	   itemHTML +='</a>';
	   itemHTML += '</li>'
	   
	   return itemHTML;
   }
}

 