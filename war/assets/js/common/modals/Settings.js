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
                                
                                var saturationWeights = [
                                  'Applied Codes',
                                  'Deleted Code Relationships',
                                  'Deleted Codes',
                                  'New Documents',
                                  'New Code Relationships',
                                  'New Codes',
                                  'Relocated Codes',
                                  'Code Author Changes',
                                  'CodeBookEntry Definition Changes',
                                  'CodeBookEntry Example Changes',
                                  'CodeBookEntry Short Definition Changes',
                                  'CodeBookEntry When Not To Use Changes',
                                  'CodeBookEntry When To Use Changes',
                                  'Code Color Changes',
                                  'Code Memo Changes',
                                  'Code Name Changes'
                                ];

				formElements += '<div class="checkbox">';
				formElements += '<label><input id="settingsUmlEditorEnabled" type="checkbox" value=""' + checked + '>Enable UML Editor</label>';
				formElements += '</div>';
				formElements += '<div>';
				formElements += '<p><b>Saturation Configuration</b></p>';
				formElements += '<p>Default interval for saturation: <input id="interval" type="number" value="-1" min="1" max="20" style="width: 60px;"/> revisions</p>';
				formElements += '<table><tr><th>Change</th><th>Weight in %</th><th>Saturation at XX%</th></tr>';
                                for(var i in saturationWeights) {
                                    formElements += '<tr>';
                                    //TODO
                                    formElements += '<td>'+saturationWeights[i]+'</td><td><input id="interval" type="number" value="-1" min="0" max="100" style="width: 60px;"/>%</td><td><input id="interval" type="number" value="-1" min="0" max="100" style="width: 60px;"/>%</td>';
                                    formElements += '</tr>';
                                }
				formElements += '</table>';
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