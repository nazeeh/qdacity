import VexModal from './VexModal';

export default class CustomForm extends VexModal {

	constructor(message) {
		super();
		this.formElements = "";
		this.message = message;
	
	  this.formElements += '<div class="vex-custom-input-wrapper">';
	  itemList.forEach(function(el) {
		  _this.formElements += '<input type="checkbox" name="'+name+'" value="'+el.id+'">'+el.title+'<br>';
  	  });
	  this.formElements += '</div>';
	  this.formElements += '</div>';
  }
  
    addSelect(name, options, label) {
      	  var _this = this;
	  this.formElements += '<div class="vex-custom-field-wrapper">';

	  this.formElements += '<div class="vex-custom-input-wrapper">';
	  this.formElements += label+': ';
	  this.formElements += '<select name="'+name+'">';
	  options.forEach(function(el) {
		  _this.formElements += '<option value="'+el+'">'+el+'</option>';
  	  });
	  this.formElements += '</select>';
	  this.formElements += '</div>';
	  this.formElements += '</div>';
      
  }

	addCheckBox(name, label, checked, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += '<input type="checkbox" name="' + name + '" value="' + value + '"'
		if (checked) this.formElements += ' checked';
		this.formElements += '>' + value + '<br>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addCheckBoxes(name, itemList) {
		var _this = this;
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		itemList.forEach(function (el) {
			_this.formElements += '<input type="checkbox" name="' + name + '" value="' + el.id + '">' + el.title + '<br>';
		});
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	showModal() {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = _this.formElements;

				vex.dialog.open({
					message: _this.message,
					contentCSS: {
						width: '600px'
					},
					input: formElements,
					buttons: [$.extend({}, vex.dialog.buttons.YES, {
						text: 'OK'
					}), $.extend({}, vex.dialog.buttons.NO, {
						text: 'Cancel'
					})],
					callback: function (data) {

						if (data != false) {
							resolve(data);
						} else reject(data);
					}
				});
			}
		);

		return promise;
	}

}