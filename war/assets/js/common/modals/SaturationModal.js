import ReactLoading from '../ReactLoading.jsx';

import VexModal from './VexModal';
import IntercoderAgreementByDoc from './IntercoderAgreementByDoc';
import IntercoderAgreementByCode from './IntercoderAgreementByCode';
import BinaryDecider from './BinaryDecider';
import ProjectEndpoint from '../endpoints/ProjectEndpoint';
import ValidationEndpoint from '../endpoints/ValidationEndpoint';
import 'script!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';


export default class SaturationModal extends VexModal {

	constructor(projectId) {
		super();
		this.formElements = '';
		this.projectId = projectId;
		this.results;
	}

	showModal() {

		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = _this.formElements;
				var buttonArray = [$.extend({}, vex.dialog.buttons.YES, {
					text: 'OK'
				})];

				vex.dialog.open({
					message: "Saturation",
					contentCSS: {
						width: '900px'
					},
					input: formElements,
					buttons: buttonArray,
					callback: function (data) {

						if (data != false) {
							resolve(data);
						} else reject(data);
					}
				});
				ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoading'));

			}
		);

		return promise;
	}



}