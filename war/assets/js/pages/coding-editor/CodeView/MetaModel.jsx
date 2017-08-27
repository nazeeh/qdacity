import React from 'react';
import styled from 'styled-components';

import MetaModelView from './MetaModelView.jsx';
import CodeRelationsView from './CodeRelationsView.jsx';
import MetaModelElement from './MetaModelElement';
import SimpleCodesystem from '../Codesystem/SimpleCodesystem.jsx';

import MetaModelEntityEndpoint from '../../../common/endpoints/MetaModelEntityEndpoint';

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
		this.props.updateSelectedCode(this.props.code, true);
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

	relatinoshipSourceChanged(sourceCode) {

	}

	relatinoshipDestinationChanged(destinationCode) {

	}

	renderContent(isRelationship) {
		if (!isRelationship) {
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

			let shouldHighlightNode = (code) => {
				return false;
			};

			return (
				<div>
                    <div className="col-sm-3">
                        Source-Code:
                        <SimpleCodesystem height="200" selected={sourceCode} notifyOnSelected={this.relatinoshipSourceChanged} shouldHighlightNode={shouldHighlightNode} codesystem={this.props.getCodeSystem()} />                        
                    </div>
                    <div className="col-sm-3">
                        Destination-Code:
                        <SimpleCodesystem height="200" selected={destinationCode} codesystem={this.props.getCodeSystem()} notifyOnSelected={this.relatinoshipDestinationChanged} />
                    </div>
                </div>
			);
		}
	}

	render() {
		const _this = this;

		this.setActiveIds(this.props.code.mmElementIDs);

		let isRelationship = false;

		this.state.selected.forEach(selectedId => {
			const selected = _this.getElement(selectedId);
			if (selected.type == "RELATIONSHIP") {
				isRelationship = true;
			}
		});

		return (
			<StyledCodeviewComponent>
				<div>   
    		        <div className="col-sm-6">
		                <MetaModelView code={this.props.code} selected={this.state.selected} elements={this.state.elements} updateActiveElement={this.updateActiveElement} setElements={this.setElements}/>
    	            </div>
		            {this.renderContent(isRelationship)}
				</div>
			</StyledCodeviewComponent>
		);
	}
}