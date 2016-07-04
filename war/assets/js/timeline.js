class Timeline  {
  constructor() {

    this.html = "";
  
  }
  
  getHTML(){
	  return this.html;
  }

  addRevInfoToTimeline(comment){
  	 
  	 this.html += '<li>';
  		 this.html += '<i class="fa fa-comments bg-yellow"></i>';
  		 this.html += '<span class="timelineType" style="display:none;">done</span>';
  		this.html += '<div class="timeline-item">';
  		this.html += ' <h3 class="timeline-header timelineUserName"><b> Revision Description </b> </h3>';

  		this.html += '<div class="timeline-body timelineContent">';
  		this.html += comment;

  		this.html += '</div>';
  		
  		this.html += '</div>';
  		this.html += '</li>';
   }
   
   addTimeLabelToTimeline(label){
  	this.html += '<li class="time-label">';
  	this.html += '<span class="timelineType" style="display:none;">label</span>';
  	this.html += '<span class="bg-red timelineTime">';
  	this.html += label;
  	this.html += '</span>';
  	this.html += '</li>';
   }
}

 