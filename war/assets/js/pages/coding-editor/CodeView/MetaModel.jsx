import React from 'react';
import styled from 'styled-components';

import MetaModelView from './MetaModelView.jsx';
import CodeRelationsView from './CodeRelationsView.jsx';
import MetaModelElement from './MetaModelElement';
import SimpleCodesystem from '../Codesystem/SimpleCodesystem.jsx';

import MetaModelEntityEndpoint from '../../../common/endpoints/MetaModelEntityEndpoint';
import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

const StyledCodeviewComponent = styled.div `
    padding: 8px 8px 0px 8px;
`;

export default class MetaModel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			code: {},
			elements: {},
			selected: []
		};

		this.getElement = this.getElement.bind(this);
		this.addSelected = this.addSelected.bind(this);
		this.setElements = this.setElements.bind(this);
		this.setActiveElement = this.setActiveElement.bind(this);
		this.updateActiveElement = this.updateActiveElement.bind(this);
		this.relatinoshipSourceChanged = this.relatinoshipSourceChanged.bind(this);
		this.relatinoshipDestinationChanged = this.relatinoshipDestinationChanged.bind(this);
	}

	setElements(elements) {
		this.setState({
			elements: elements
		});
	}

	setActiveIds(elementIds) {
		var _this = this;

		_this.resetSelection();

		if (elementIds != null) {
			elementIds.forEach((elementId) => _this.setActiveId(elementId));
		} else {
			this.setActiveId(null);
		}
	}

	setActiveId(elementId) {
		let element = this.getElement(elementId);

		if (typeof element != 'undefined' && element != null) {
			this.setActiveElement(element);
		} else {
			this.resetSelection();
		}
	}

	updateActiveElement(element) {
		this.setActiveElement(element);
		this.props.code.mmElementIDs = this.state.selected.slice(0);

		if (!this.isRelationshipCode()) {
			this.props.updateSelectedCode(this.props.code, true);
		} else {
			this.props.updateSelectedCode(this.props.code, false);
			this.relationshipCodeMetaModelChanged();
		}

		this.forceUpdate();
	}

	setActiveElement(element) {
		const _this = this;

		// Compare element with selection
		this.state.selected.forEach((selectedId) => {
			const selected = _this.getElement(selectedId);

			if (element.type != selected.type) {
				const groupId = _this.state.elements[selected.getGroup()];
				_this.resetSelectionForGroup(groupId);
			}
		});


		let group = this.state.elements[element.getGroup()];

		this.resetSelectionForGroup(group);

		element.toggleSelected();

		this.selectGeneralizations(element.getId(), group);
		this.addSelected(element.getId());
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

	resetSelection() {
		for (let key in this.state.elements) {
			this.resetSelectionForGroup(this.state.elements[key]);
		}
	}

	resetSelectionForGroup(group) {
		let _this = this;

		group.forEach(function (el) {
			el.setSelected(false);

			let index = _this.state.selected.indexOf(el.id);
			if (index > -1) {
				_this.state.selected.splice(index, 1);
			}
		});
	}

	addSelected(id) {
		this.state.selected.push(id);
	}

	getElement(elementId) {
		let idFilter = function (el) {
			return el.getId() === elementId;
		}

		for (let key in this.state.elements) {
			let element = this.state.elements[key].find(idFilter);

			if (element != null) {
				return element;
			}
		}

		return null;
	}

	setCode(code) {
		this.setState({
			code: code
		});
	};

	saveSettings() {
		this.props.code.mmElementIDs = this.state.selected;
		this.props.updateSelectedCode(this.props.code, true);
	}

	isRelationshipCode() {
		const _this = this;

		let isRelationship = false;

		this.state.selected.forEach(selectedId => {
			const selected = _this.getElement(selectedId);
			if (selected.type == "RELATIONSHIP") {
				isRelationship = true;
			}
		});

		return isRelationship;
	}

	relationshipCodeMetaModelChanged() {
		const _this = this;

		CodesEndpoint.updateRelationshipCodeMetaModel(this.props.code.id, this.props.code.mmElementIDs[0]).then((resp) => {
			// Update the relation
			let code = _this.props.getCodeById(resp.relationshipCode.key.parent.id);

			for (let i = 0; i < code.relations.length; i++) {
				let rel = code.relations[i];

				if (rel.key.id == resp.relationshipCode.key.id) {
					rel.mmElementId = _this.props.code.mmElementIDs[0];
					break;
				}
			}
		});
	}

	relatinoshipSourceChanged(sourceCode) {
		this.updateRelationShipCode(sourceCode, null);
	}

	relatinoshipDestinationChanged(destinationCode) {
		this.updateRelationShipCode(null, destinationCode);
	}

	updateRelationShipCode(newSourceCode, newDestinationCode) {
		const _this = this;

		let relation = this.props.code.relationshipCode;

		CodesEndpoint.removeRelationship(relation.key.parent.id, relation.key.id).then((resp) => {
			// Update the code
			const storedCode = _this.props.getCodeByCodeID(resp.codeID);
			storedCode.relations = resp.relations;

			// Select relation source and destination
			let newRelationSourceId = null;

			if (newSourceCode != null) {
				newRelationSourceId = newSourceCode.id;
			} else {
				newRelationSourceId = relation.key.parent.id;
			}

			let newRelationDestinationCodeId = null;

			if (newDestinationCode != null) {
				newRelationDestinationCodeId = newDestinationCode.codeID;
			} else {
				newRelationDestinationCodeId = relation.codeId;
			}

			CodesEndpoint.addRelationship(newRelationSourceId, newRelationDestinationCodeId, relation.mmElementId).then((resp2) => {
				// Update the code
				const storedCode2 = _this.props.getCodeByCodeID(resp2.codeID);
				storedCode2.relations = resp2.relations;

				// Find relation
				let newRelation = null;

				for (let i = 0; i < resp2.relations.length; i++) {
					let rel = resp2.relations[i];

					if (rel.mmElementId == relation.mmElementId
						&& rel.codeId == newRelationDestinationCodeId
						&& rel.key.parent.id == newRelationSourceId) {
						newRelation = rel;
						break;
					}
				}

				CodesEndpoint.updateRelationshipCode(_this.props.code.id, resp2.id, newRelation.key.id).then((resp3) => {
					_this.props.code.relationshipCode = resp3.relationshipCode;

					// Update the relation
					for (let i = 0; i < storedCode2.relations.length; i++) {
						let rel = storedCode2.relations[i];

						if (rel.key.id == newRelation.key.id) {
							rel.relationshipCodeId = resp3.id;
							break;
						}
					}
				});
			});
		});
	}

	renderContent() {
		if (!this.isRelationshipCode()) {
			return (
				<div>
                    <div className="col-sm-6">
			            <CodeRelationsView {...this.props} code={this.props.code} getElement={this.getElement} elements={this.state.elements} getCodeByCodeID={this.props.getCodeByCodeID} createCode={this.props.createCode} selectCode={this.props.selectCode} />
                    </div>
		        </div>
			);
		} else {
			const sourceCode = this.props.getCodeById(this.props.code.relationshipCode.key.parent.id);
			const destinationCode = this.props.getCodeByCodeID(this.props.code.relationshipCode.codeId);

			let isCodeSelectable = (code) => {
				return code.relationshipCode == null;
			};

			return (
				<div>
                    <div className="col-sm-3">
                        Source-Code:
                        <SimpleCodesystem height="200" selected={sourceCode} codesystem={this.props.getCodeSystem()} notifyOnSelected={this.relatinoshipSourceChanged} isCodeSelectable={isCodeSelectable} />                        
                    </div>
                    <div className="col-sm-3">
                        Destination-Code:
                        <SimpleCodesystem height="200" selected={destinationCode} codesystem={this.props.getCodeSystem()} notifyOnSelected={this.relatinoshipDestinationChanged} isCodeSelectable={isCodeSelectable} />
                    </div>
                </div>
			);
		}
	}

	render() {
		const _this = this;

		this.setActiveIds(this.props.code.mmElementIDs);

		return (
			<StyledCodeviewComponent>
				<div>   
    		        <div className="col-sm-6">
		                <MetaModelView code={this.props.code} selected={this.state.selected} elements={this.state.elements} updateActiveElement={this.updateActiveElement} setElements={this.setElements}/>
    	            </div>
		            {this.renderContent()}
				</div>
			</StyledCodeviewComponent>
		);
	}
}