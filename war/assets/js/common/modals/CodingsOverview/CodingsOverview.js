import ReactDOM from 'react-dom';

import VexModal from '../VexModal';
import CodingInstances from './CodingInstances.jsx';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

export default class CodingsOverview extends VexModal {
	constructor() {
		super();
		this.formElements =
			'<div id="codingsOverview"><div id="overviewMount"></div></div>';
		//this.setActiveElement = this.setActiveElement.bind(this);
	}

	showModal(codeID, documentsView) {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			var formElements = _this.formElements;

			vex.dialog.open({
				message: 'Coded text segments',
				contentCSS: {
					width: '900px'
				},
				input: formElements,
				buttons: [
					$.extend({}, vex.dialog.buttons.NO, {
						text: 'Close'
					})
				],
				callback: function(data) {
					if (data != false) {
						resolve(data);
					} else reject(data);
				}
			});

			_this.mmRelationshipsView = ReactDOM.render(
				<IntlProvider>
					<CodingInstances codeID={codeID} documentsView={documentsView} />
				</IntlProvider>,
				document.getElementById('overviewMount')
			);
		});

		return promise;
	}
}
