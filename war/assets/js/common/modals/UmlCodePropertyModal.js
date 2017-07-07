import VexModal from './VexModal';
import SimpleCodesystem from '../../pages/coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class UmlCodePropertyModal extends VexModal {

	constructor(headline, codesystem) {
		super();

		this.headline = headline;

		this.codesystemView = null;

		this.codesystem = codesystem;



		// TODO copy paste code
		let rootCodes = this.codesystem.filter(function (code) {
			return !code.parentID;
		});

		for (var i = 0; i < rootCodes.length; i++) {
			rootCodes[i].collapsed = false;
			this.buildTree(rootCodes[i], this.codesystem, false)
		}

		this.sortCodes(rootCodes);

		this.codesystem = rootCodes;
	}

	buildTree(currentCode, allCodes, currentNodeCollapsed) {
		var _this = this;
		currentCode.collapsed = currentNodeCollapsed;

		if (currentCode.subCodesIDs) {
			var subCodes = allCodes.filter(function (code) {
				return currentCode.subCodesIDs.indexOf(code.codeID) != -1;
			});
			currentCode.children = subCodes;

			subCodes.forEach((subCode) => {
				_this.buildTree(subCode, allCodes, true)
			});
		} else {
			currentCode.children = [];
		}
	}

	sortCodes(codeSiblings) {
		var _this = this;
		codeSiblings.sort((a, b) => {
			return a.name > b.name;
		});

		codeSiblings.forEach((code) => {
			if (code.children) {
				_this.sortCodes(code.children);
			}
		})
	}


	showModal(metaModelEntities, metaModelRelations) {
		const _this = this;

		let promise = new Promise(
			function (resolve, reject) {
				let formElements = '<div id="codesystemView"></div>';

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

						ReactDOM.unmountComponentAtNode(document.getElementById('codesystemView'));

						if (data != false) {
							resolve(result);
						} else {
							reject(result);
						}
					}
				});

				_this.codesystemView = ReactDOM.render(<SimpleCodesystem codesystem={_this.codesystem} />, document.getElementById('codesystemView'));
			}
		);

		return promise;
	}
}