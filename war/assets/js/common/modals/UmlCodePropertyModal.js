import ReactDOM from 'react-dom';

import VexModal from './VexModal';

import SimpleCodesystem from '../../pages/coding-editor/Codesystem/SimpleCodesystem.jsx';

import UmlClassRelation from '../../pages/uml-editor/model/UmlClassRelation.js';

export default class UmlCodePropertyModal extends VexModal {

	constructor(umlEditor, headline, sourceCode, codesystem, relationMetaModelEntityName, mappingAction) {
		super();

		this.umlEditor = umlEditor;
		this.headline = headline;
		this.sourceCode = sourceCode;
		this.codesystem = codesystem;

		this.relationMetaModelEntityName = relationMetaModelEntityName;
		this.mappingAction = mappingAction;

		this.codesystemView = null;
	}

	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		const codeIsNotValid = (code) => {
			if (code == null) {
				return true;
			}

			const sourceUmlClass = _this.umlEditor.getUmlClassManager().getByCode(_this.sourceCode);
			const destinationUmlClass = _this.umlEditor.getUmlClassManager().getByCode(code);

			const metaModelEntity = _this.umlEditor.getMetaModelEntityByName(_this.relationMetaModelEntityName);

			const umlCodeRelation = new UmlClassRelation(sourceUmlClass, destinationUmlClass, metaModelEntity);

			return _this.umlEditor.getMetaModelMapper().evaluateCodeRelation(umlCodeRelation) != _this.mappingAction;
		}

		const isCodeSelectable = (code) => {
			return !codeIsNotValid(code);
		}

		const notifyOnSelected = (code) => {
			let possibleSaveButtons = document.getElementsByClassName('vex-dialog-button-primary');

			if (possibleSaveButtons == null || possibleSaveButtons.length != 1) {
				throw new Error('Detected more than one (or none) possible vex save button.');
			}

			let saveButton = possibleSaveButtons[0];

			if (codeIsNotValid(code)) {
				// Disable save
				saveButton.disabled = true;
			} else {
				// Enable save
				saveButton.disabled = false;
			}
		};

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

				_this.codesystemView = ReactDOM.render(<SimpleCodesystem maxHeight="500" notifyOnSelected={notifyOnSelected} codesystem={_this.codesystem.getCodesystem()} isCodeSelectable={isCodeSelectable} />, document.getElementById(codesystemContainerId));
				notifyOnSelected(null);
			}
		);

		return promise;
	}
}