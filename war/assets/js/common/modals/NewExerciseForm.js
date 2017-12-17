import ReactDOM from 'react-dom';
import VexModal from './VexModal';
import DropDownButton from '../../common/styles/DropDownButton.jsx';

export default class NewExerciseForm extends VexModal {

	constructor(message) {
		super();
		this.formElements = "";
		this.message = message;
	}

	addTextInput(name, label, placeholder, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';
		this.formElements += '<label for="' + name + '">' + label + '</label>';
		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += '<input placeholder="' + placeholder + '" name="' + name + '" type="text" value="' + value + '" ></input>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addTextField(name, label, placeholder, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';
		this.formElements += '<label for="' + name + '">' + label + '</label>';
		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += '<textarea placeholder="' + placeholder + '" rows="15" cols="200" name="' + name + '" type="text" value="' + value + '" ></textarea>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addSelect(name, options, label, initialValue) {
		var _this = this;
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += label + ': ';
		this.formElements += '<select name="' + name + '">';

		var isDefault = function (el) {
			return ((el == initialValue) ? 'selected="selected"' : '');
		}

		options.forEach(function (el) {
			_this.formElements += '<option value="' + el + '" ' + isDefault(el) + '>' + el + '</option>';
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
