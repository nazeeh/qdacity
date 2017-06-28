import VexModal from './VexModal';
import MetaModelView from '../../pages/coding-editor/MetaModelView.jsx';

export default class UmlCodeMetaModelModal extends VexModal {

	constructor(code) {
		super();

		this.code = code;
		this.meatModelView = null;
	}

	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		let promise = new Promise(
			function (resolve, reject) {
				let formElements = '<div id="metaModelView"></div>';

				vex.dialog.open({
					message: "MetaModel",
					contentCSS: {
						width: '600px'
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
						ReactDOM.unmountComponentAtNode(document.getElementById('metaModelView'));

						let result = {};
						result.ids = _this.meatModelView.getActiveElementIds();

						if (data != false) {
							resolve(result);
						} else {
							reject(result);
						}
					}
				});

				_this.meatModelView = ReactDOM.render(<MetaModelView filter={"PROPERTY"} metaModelEntities={metaModelEntities} metaModelRelations={metaModelRelations} />, document.getElementById('metaModelView'));
				_this.meatModelView.setActiveIds(_this.code.mmElementIDs);
			}
		);

		return promise;
	}

	getMetaModelView() {
		return this.meatModelView;
	}

}