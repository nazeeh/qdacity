import ReactDOM from 'react-dom';

import ReactLoading from '../ReactLoading.jsx';
import VexModal from './VexModal';
import SaturationView from '../saturation/SaturationView.jsx';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class SaturationModal extends VexModal {

	constructor(projectId) {
		super();
		this.formElements = '';
		this.projectId = projectId;
		this.formElements += '<div id="saturation" style="text-align: center; background-color: #eee; font-color:#222; overflow:hidden; overflow-x: scroll;"><div id="saturationMetaData"></div><div id="satTable"></div><div style="height: 350px;" id="saturationChart"></div><div id="loadingAnimation" class="centerParent"><div id="reactLoading" class="centerChild"></div></div></div>';
	}

	showModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = _this.formElements;
				var buttonArray = [$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({id: 'modal.ok', defaultMessage: 'OK'})
				})];
				vex.dialog.open({
					message: formatMessage({id: 'saturationmodal.saturation', defaultMessage: 'Saturation'}),
					contentCSS: {
						width: '900px'
					},
					input: formElements,
					buttons: buttonArray,
					callback: function (data) {

						if (data != false) {
							resolve(data);
						} else
							reject(data);
					}
				});
				ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoading'));

				ReactDOM.render(
					<IntlProvider>
						<SaturationView projectId={_this.projectId} />
					</IntlProvider>, document.getElementById('saturation')
				);
			}
		);
		return promise;
	}

}