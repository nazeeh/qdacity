class Timeline {
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
  		this.html += '<a id="deleteRevisionBtn" revId="'+revID+'" class="btn btn-danger btn-xs">Delete</a>';
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
		this.html += ' <h3 class="timeline-header timelineUserName"><b> Validation Projects </b> </h3>';

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
	   itemHTML = '<li><span class="project_name">'+validationProject.name+'</span><span class="project_id hidden">'+validationProject.id+'</span></li>';
	   
	   return itemHTML;
   }
}

 