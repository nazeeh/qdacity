import VexModal from './VexModal';
import SaturationSettings from '../saturation/SaturationSettings.jsx';
import SaturationWeights from '../saturation/SaturationWeights.js'

export default class Settings extends VexModal {

	constructor() {
		super();
                this.state = { saturationParameters : undefined };
	}

	showModal(umlEditorEnabled, projectId) {
                var _this = this;              
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
				formElements += '<div id="saturationSettings">';
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
                                                        var saturationParameters = {};
                                                        var saturationWeights = new SaturationWeights();
                                                        var changeWeightNames = saturationWeights.getPropertyNamesChangeWeight();
                                                        var saturationMaximumNames = saturationWeights.getPropertyNamesSaturationMaximum();
                                                        for(var i in changeWeightNames) {
                                                            saturationParameters[changeWeightNames[i]] = $('#cell'+i+'-1-input').prop('value');
                                                            saturationParameters[saturationMaximumNames[i]] = $('#cell'+i+'-2-input').prop('value');
                                                        }
                                                        saturationParameters['lastSatResults'] = $('#saturation-interval').prop('value');
                                                        gapi.client.qdacity.saturation.setSaturationParameters(saturationParameters); 
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
                                ReactDOM.render(<SaturationSettings projectId={projectId} />, document.getElementById('saturationSettings'));
			}
		);

		return promise;
	}

}