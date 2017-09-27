import ReactDOM from 'react-dom';

import VexModal from './VexModal';
import SaturationSettings from '../saturation/SaturationSettings.jsx';
import SaturationWeights from '../saturation/SaturationWeights.js'
import SaturationEndpoint from '../endpoints/SaturationEndpoint.js'

export default class Settings extends VexModal {

	constructor() {
		super();
		this.state = {
			saturationParameters: undefined
		};
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
						width: '600px',
						"margin-top": '-100px'
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
							for (var i in changeWeightNames) {
								var changeWeightInputValue = $('#cell' + i + '-1-input').prop('value');
								var saturationMaxInputValue = $('#cell' + i + '-2-input').prop('value');
								if (typeof changeWeightInputValue === 'undefined') {
									//if true, then we applied an average, so lets look up the average
									var categoryIdx = saturationWeights.getArtificialCategoryIndex(saturationWeights.getCategoryForIndex(i));
									var newAverageWeight = $("#input-category-" + categoryIdx + "-1").prop('value');
									var oldAverageWeight = $("#input-category-" + categoryIdx + "-1-old").prop('value');
									var newAverageMaxInput = $("#input-category-" + categoryIdx + "-2").prop('value');
									var oldAverageMaxInput = $("#input-category-" + categoryIdx + "-2-old").prop('value');
									var oldChangeWeightInputValue = $('#cell' + i + '-1-input-old').prop('value');
									var oldSaturationMaxInputValue = $('#cell' + i + '-2-input-old').prop('value');

									var factorWeight = 1;
									if (oldAverageWeight > 0) {
										factorWeight = 1 + (newAverageWeight - oldAverageWeight) / oldAverageWeight;
									}
									var factorMax = 1;
									if (oldAverageMaxInput > 0) {
										factorMax = 1 + (newAverageMaxInput - oldAverageMaxInput) / oldAverageMaxInput;
									}

									changeWeightInputValue = oldChangeWeightInputValue * factorWeight;
									saturationMaxInputValue = oldSaturationMaxInputValue * factorMax;
								}

								saturationParameters[changeWeightNames[i]] = changeWeightInputValue / 100;
								saturationParameters[saturationMaximumNames[i]] = saturationMaxInputValue / 100;
							}
							saturationParameters['lastSatResults'] = $('#saturation-interval').prop('value');
							saturationParameters['projectId'] = projectId;
							new SaturationEndpoint().setSaturationParameters(saturationParameters);
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