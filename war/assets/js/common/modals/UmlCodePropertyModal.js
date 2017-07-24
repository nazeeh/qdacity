import VexModal from './VexModal';
import SimpleCodesystem from '../../pages/coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class UmlCodePropertyModal extends VexModal {

	constructor(headline, codesystemView) {
		super();

		this.headline = headline;
		this.codesystemView = codesystemView;
	}

	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		let promise = new Promise(
			function (resolve, reject) {
				const codesystemContainerId = 'umlCodePropertyModalCodesystemView';
				let formElements = '<div id="' + codesystemContainerId + '"></div>';

				vex.dialog.open({
					message: _this.headline,
					contentCSS: {
						width: '500px'
					},
					input: formElements,
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, {
							text: 'Save'
						}),
						$.extend({}, vex.dialog.buttons.NO, {
							text: 'Cancel'
						}),
					],
					callback: function (data) {
						let result = {};
						result.selectedCode = _this.codesystemView.getSelected();

						ReactDOM.unmountComponentAtNode(document.getElementById(codesystemContainerId));

						if (data != false) {
							resolve(result);
						} else {
							reject(result);
						}
					}
				});

				_this.codesystemView = ReactDOM.render(<SimpleCodesystem codesystem={_this.codesystemView.getCodesystem()} />, document.getElementById(codesystemContainerId));
			}
		);

		return promise;
	}
}