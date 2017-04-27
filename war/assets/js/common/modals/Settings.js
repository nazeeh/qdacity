import VexModal from './VexModal';

export default class Settings extends VexModal {

	constructor() {
		super();
	}

	showModal(umlEditorEnabled) {
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = '';

				formElements += '<div class="vex-custom-field-wrapper">';
				formElements += '<div class="vex-custom-input-wrapper">';

				var checked = '';
				if (umlEditorEnabled) checked = ' checked';

				formElements += '<div class="checkbox">';
				formElements += '<label><input id="settingsUmlEditorEnabled" type="checkbox" value=""' + checked + '>Enable UML Editor</label>';
				formElements += '</div>';

				formElements += '<br>';
				formElements += '</div>';
				formElements += '</div>';


				vex.dialog.open({
					message: "Settings",
					contentCSS: {
						width: '600px'
					},
					input: formElements,
					buttons: [$.extend({}, vex.dialog.buttons.YES, {
						text: 'Save',
						click: function ($vexContent, event) {
							$vexContent.data().vex.value = {
								'umlEditorEnabled': $('#settingsUmlEditorEnabled').prop('checked')
							};
							vex.close($vexContent.data().vex.id);
						}
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