import ReactDOM from 'react-dom';

import VexModal from '../VexModal';
import MetaModelView from './CodingInstances.jsx';

export default class CodingsOverview extends VexModal {

	constructor(mmElements, codeSystem) {
		super();
		this.formElements = '<div id="codingsOverview"><div id="overviewMount"></div></div>';
		//this.setActiveElement = this.setActiveElement.bind(this);

	}


	showModal() {

		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = _this.formElements;

				vex.dialog.open({
					message: "New Code Relationship",
					contentCSS: {
						width: '900px'
					},
					input: formElements,
					buttons: [
						$.extend({}, vex.dialog.buttons.NO, {
							text: 'Close'
						}),
					],
					callback: function (data) {

						if (data != false) {
							resolve(data);
						} else reject(data);
					}
				});

				_this.mmRelationshipsView = ReactDOM.render(<CodingInstances />, document.getElementById('overviewMount'));
			}
		);

		return promise;
	}

}