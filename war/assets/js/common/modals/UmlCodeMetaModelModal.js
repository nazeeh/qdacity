import ReactDOM from 'react-dom';

import VexModal from './VexModal';
import MetaModelView from '../../pages/coding-editor/CodeView/MetaModelView.jsx';
import MetaModelDialog from '../../pages/uml-editor/MetaModelDialog.jsx';

export default class UmlCodeMetaModelModal extends VexModal {

	constructor(code) {
		super();

		this.code = code;
		this.oldMetaModelElementIds = [];

		this.metaModelDialog = null;
	}

	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		this.oldMetaModelElementIds = this.code.mmElementIDs;

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
						let result = {};
						result.ids = _this.metaModelDialog.getActiveElementIds();
						result.oldIds = _this.oldMetaModelElementIds;

						ReactDOM.unmountComponentAtNode(document.getElementById('metaModelView'));

						if (data != false) {
							resolve(result);
						} else {
							reject(result);
						}
					}
				});

				_this.metaModelDialog = ReactDOM.render(<MetaModelDialog code={_this.code} updateSelectedCode={() => {}} metaModelEntities={metaModelEntities} metaModelRelations={metaModelRelations} />, document.getElementById('metaModelView'));
			}
		);

		return promise;
	}
}