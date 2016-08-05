import VexModal from './VexModal';

export default class BinaryDecider extends VexModal {
	
  constructor(message, optionA, optionB) {
	  super();
	  this.message = message;
	  this.optionA = optionA;
	  this.optionB = optionB;
  }
  
  showModal(){
	  var _this = this;
	  var promise = new Promise(
			  function(resolve, reject) {
				  vex.dialog.open({ 
					    message: _this.message,
					    contentCSS: { width: '500px' },
					    buttons: [
				         	$.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: _this.optionB, click: function($vexContent, event) {
					            $vexContent.data().vex.value = 'optionB';
					            vex.close($vexContent.data().vex.id);
					        }}),
					        $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn pull-left vex-dialog-button-primary ', text: _this.optionA, click: function($vexContent, event) {
					            $vexContent.data().vex.value = 'optionA';
					            vex.close($vexContent.data().vex.id);
					        }}),
					       
					    ],
					    callback: function(value) {
					    	resolve(value);					        
					    }
					});
			  }
		  );
	  
	  return promise;
  }
  
}

 