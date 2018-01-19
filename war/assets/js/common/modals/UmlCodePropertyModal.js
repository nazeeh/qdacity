import ReactDOM from 'react-dom';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import VexModal from './VexModal';

import SimpleCodesystem from '../../pages/coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class UmlCodePropertyModal extends VexModal {
	constructor(
		umlEditor,
		headline,
		sourceCode,
		codesystem,
		relationMetaModelEntityName,
		mappingIdentifier
	) {
		super();

		this.umlEditor = umlEditor;
		this.headline = headline;
		this.sourceCode = sourceCode;
		this.codesystem = codesystem;

		this.relationMetaModelEntityName = relationMetaModelEntityName;
		this.mappingIdentifier = mappingIdentifier;

		this.codesystemView = null;
	}

	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		const codeIsNotValid = destinationCode => {
			if (destinationCode == null) {
				return true;
			}

			const metaModelEntity = _this.umlEditor.getMetaModelEntityByName(
				_this.relationMetaModelEntityName
			);

			const relation = {
				key: {
					parent: {
						id: this.sourceCode.id
					}
				},
				codeId: destinationCode.codeID,
				mmElementId: metaModelEntity.id
			};

			let identifiers = _this.umlEditor
				.getMetaModelMapper()
				.evaluateActionsForTarget(relation);

			return identifiers.indexOf(_this.mappingIdentifier) == -1;
		};

		const isCodeSelectable = code => {
			return !codeIsNotValid(code);
		};

		const notifyOnSelected = code => {
			let possibleSaveButtons = document.getElementsByClassName(
				'vex-dialog-button-primary'
			);

			if (possibleSaveButtons == null || possibleSaveButtons.length != 1) {
				throw new Error(
					'Detected more than one (or none) possible vex save button.'
				);
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

		let promise = new Promise(function(resolve, reject) {
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
					})
				],
				callback: function(data) {
					let result = {};
					result.selectedCode = _this.codesystemView.getSelected();

					ReactDOM.unmountComponentAtNode(
						document.getElementById(codesystemContainerId)
					);

					if (data != false) {
						resolve(result);
					} else {
						reject(result);
					}
				}
			});

			_this.codesystemView = ReactDOM.render(
				<IntlProvider>
					<SimpleCodesystem
						maxHeight="500"
						notifyOnSelected={notifyOnSelected}
						codesystem={_this.codesystem.getCodesystem()}
						isCodeSelectable={isCodeSelectable}
					/>
				</IntlProvider>,
				document.getElementById(codesystemContainerId)
			);
			notifyOnSelected(null);
		});

		return promise;
	}
}
