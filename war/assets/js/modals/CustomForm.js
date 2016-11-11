import VexModal from './VexModal';

export default class CustomForm extends VexModal {
	
  constructor(message) {
	  super();
	  this.formElements = "";
	  this.message = message;
  }
  
  addTextInput(name, label, placeholder, value){
	  this.formElements += '<div class="vex-custom-field-wrapper">';
	  this.formElements += '<label for="'+name+'">'+label+'</label>';
	  this.formElements += '<div class="vex-custom-input-wrapper">';
	  this.formElements += '<input placeholder="'+ placeholder +'" name="'+name+'" type="text" value="'+value+'" ></input>';
	  this.formElements += '</div>';
	  this.formElements += '</div>';
  }
  
  addTextField(name, label, placeholder, value){
	  this.formElements += '<div class="vex-custom-field-wrapper">';
	  this.formElements += '<label for="'+name+'">'+label+'</label>';
	  this.formElements += '<div class="vex-custom-input-wrapper">';
	  this.formElements += '<textarea placeholder="'+ placeholder +'" rows="15" cols="200" name="'+name+'" type="text" value="'+value+'" ></textarea>';
	  this.formElements += '</div>';
	  this.formElements += '</div>';
  }
  
  showModal(){
	  var _this = this;
	  var promise = new Promise(
			  function(resolve, reject) {
				  
				  var formElements =  _this.formElements;

			 		vex.dialog.open({
			 			message : _this.message,
			 			contentCSS: { width: '600px' },
			 			input : formElements,
			 			buttons : [ $.extend({}, vex.dialog.buttons.YES, {
			 				text : 'OK'
			 			}), $.extend({}, vex.dialog.buttons.NO, {
			 				text : 'Cancel'
			 			}) ],
			 			callback : function(data) {
			 				
			 				if (data != false) {
								resolve(data);
							}
							else reject(data);
			 			}
			 		});
			  }
		  );
	  
	  return promise;
  }
  
}

 