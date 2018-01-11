import ReactDOM from 'react-dom';
import React from 'react';

import VexModal from '../VexModal';
import CodingInstances from './CodingInstances.jsx';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

export default class CodingsOverview extends VexModal {

	constructor() {
		super();
		this.formElements = '<div id="codingsOverview"><div id="overviewMount"></div></div>';
		//this.setActiveElement = this.setActiveElement.bind(this);

	}


	showModal(codeID, documentsView) {

		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
				const {formatMessage} = IntlProvider.intl;
				var formElements = _this.formElements;

				vex.dialog.open({
					message: formatMessage({ id: 'codingsoverview.coded_text_segments', defaultMessage: 'Coded text segments' }),
					contentCSS: {
						width: '900px'
					},
					input: formElements,
					buttons: [
						$.extend({}, vex.dialog.buttons.NO, {
							text: formatMessage({ id: 'codingsoverview.close', defaultMessage: 'Close' })
						}),
					],
					callback: function (data) {

						if (data != false) {
							resolve(data);
						} else reject(data);
					}
				});

				_this.mmRelationshipsView = ReactDOM.render(
					<IntlProvider>
						<CodingInstances codeID={codeID} documentsView={documentsView}/>
					</IntlProvider>, document.getElementById('overviewMount')
				);
			}
		);

		return promise;
	}

}