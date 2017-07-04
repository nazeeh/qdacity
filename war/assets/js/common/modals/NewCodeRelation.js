import VexModal from './VexModal';
import MetaModelView from '../../pages/coding-editor/CodeView/MetaModelView.jsx';
import SimpleCodesystem from '../../pages/coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class NewCodeRelation extends VexModal {

	constructor(mmElements, codeSystem) {
		super();
		this.formElements = '<div id="newCodeRelation" class="row" style="text-align: center; background-color: #eee; font-color:#222;"><div class="col-sm-6">Relationship Type<br/><div id=mmRelationships/></div><div class="col-sm-6">Code<br/><div id="easytreeNewCode"><ul></ul></div><div id="easytreeNewCode2"><ul></ul></div></div></div>';

		this.mmElements = mmElements;

		this.mmRelationshipsView = {};

		this.codeSystem = codeSystem;

		this.activeElement = -1;

		this.setActiveElement = this.setActiveElement.bind(this);

	}

	setActiveElement(element) {
		var group = this.mmElements[element.getGroup()];
		//Reset
		group.forEach((el) => {
			el.setSelected(false);
		});
		element.toggleSelected();
		this.selectGeneralizations(element.getId(), group)
		this.activeElement = element;
		this.mmRelationshipsView.forceUpdate();
	}

	selectGeneralizations(elementID, group) {
		let _this = this;
		group.forEach(function (el) {
			if (el.hasSpecialization(elementID)) {
				el.setSelected(true);
				//recursion
				_this.selectGeneralizations(el.getId(), group);
			}
		});
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
						$.extend({}, vex.dialog.buttons.YES, {
							text: 'Create'
						}),
						$.extend({}, vex.dialog.buttons.NO, {
							text: 'Cancel'
						}),
					],
					callback: function (data) {

						var relationship = {};

						if (data != false) {
							relationship.mmElement = _this.activeElement;
							relationship.codeId = _this.mmCodesystemView.getSelected().codeID;
							resolve(relationship);
						} else reject(relationship);
					}
				});

				_this.mmRelationshipsView = ReactDOM.render(<MetaModelView filter={"RELATIONSHIP"} elements={_this.mmElements} updateActiveElement={_this.setActiveElement} setElements={()=>{}}/>, document.getElementById('mmRelationships'));
				_this.mmCodesystemView = ReactDOM.render(<SimpleCodesystem codesystem={_this.codeSystem} />, document.getElementById('easytreeNewCode'));
			}
		);

		return promise;
	}

	modifyNodeId(node) {
		var _this = this;
		node.id += "newCode";
		if (typeof node.children != 'undefined') {
			node.children.forEach(function (childNode) {
				_this.modifyNodeId(childNode);
			});
		}
	}


	getActiveNodeRecursive(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].isActive == true) {
				return nodes[i];
			}
			if (nodes[i].children && nodes[i].children.length > 0) {
				var result = this.getActiveNodeRecursive(nodes[i].children);
				if (typeof result != 'undefined')
					return result;
			}
		}
	}

}