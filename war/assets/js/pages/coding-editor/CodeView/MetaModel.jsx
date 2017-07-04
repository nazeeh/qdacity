import React from 'react';
import styled from 'styled-components';

import MetaModelView from './MetaModelView.jsx';
import CodeRelationsView from './CodeRelationsView.jsx';
import MetaModelElement from './MetaModelElement';

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

	render() {
		this.setActiveIds(this.props.code.mmElementIDs);
		return (
			<StyledCodeviewComponent>
				<div>
					<div className="col-sm-6">
						<MetaModelView filter={"PROPERTY"} code={this.props.code} selected={this.state.selected} elements={this.state.elements} updateActiveElement={this.updateActiveElement} setElements={this.setElements}/>
					</div>
					<div className="col-sm-6">
						<CodeRelationsView {...this.props} code={this.props.code} getElement={this.getElement}  elements={this.state.elements}/>
					</div>
				</div>
			</StyledCodeviewComponent>

		);
	}
}