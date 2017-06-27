import React from 'react'

import MetaModelView from './MetaModelView.jsx';
import CodeRelationsView from './CodeRelationsView.jsx';
import MetaModelElement from './MetaModelElement';

import MetaModelEntityEndpoint from '../../../common/endpoints/MetaModelEntityEndpoint';

export default class MetaModel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: {},
			elements: {},
			selected: []
		};
		//this.init();
		this.getElement = this.getElement.bind(this);
		this.addSelected = this.addSelected.bind(this);
		this.setElements = this.setElements.bind(this);
		this.setActiveElement = this.setActiveElement.bind(this);

	}
	//
	// init() {
	// 	let _this = this;
	// 	MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
	// 		let entities = resp.items || [];
	//
	// 		let entitiesById = {};
	// 		for (let i = 0; i < entities.length; i++) {
	//
	//
	// 			let element = new MetaModelElement(entities[i].id, entities[i].name, entities[i].type, entities[i].group);
	//
	// 			entitiesById[element.id] = element;
	// 		}
	//
	// 		let mmElements = {};
	// 		for (let id in entitiesById) {
	// 			let entity = entitiesById[id];
	//
	// 			let group = entity.getGroup();
	//
	// 			if (!mmElements.hasOwnProperty(group)) {
	// 				mmElements[group] = [];
	// 			}
	//
	// 			mmElements[group].push(entity);
	// 		}
	//
	// 		_this.setState({
	// 			elements: mmElements
	// 		});
	//
	// 	});
	// }

	setElements(elements){
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
			this.setState({
				elements: this.state.elements
			});
		}
	}

	setActiveElement(element) {

		let group = this.state.elements[element.getGroup()];

		this.resetSelectionForGroup(group);

		element.toggleSelected();

		//this.state.selected.push(element.getId());

		this.selectGeneralizations(element.getId(), group);
		this.addSelected(element.getId());
		// this.setState({
		// 	elements: this.state.elements
		// });
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

	addSelected(id){
		this.state.selected.push(id);
		this.setState({
			selected: this.state.selected
		})
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

	setCode(code){
		this.setActiveIds(code.mmElementIDs);
		this.setState({
			code: code
		});
	};

	saveSettings(){
		this.state.code.mmElementIDs = this.state.selected;
		this.props.updateCode(this.state.code);
	}

	render(){
		return(
			<div>
				<div className= "row">
					<div className="col-sm-6">
						<MetaModelView filter={"PROPERTY"} code={this.state.code} selected={this.state.selected} elements={this.state.elements} addSelected={this.addSelected} setActiveElement={this.setActiveElement} setElements={this.setElements}/>
					</div>
					<div className="col-sm-6">
<CodeRelationsView {...this.props} code={this.state.code} getElement={this.getElement}/>
					</div>
				</div>

				<div>
					<a id="btnSaveMetaModelAttr" className="btn btn-default btn-default" onClick={() => this.saveSettings()} >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</div>
			</div>

		);
	}
}