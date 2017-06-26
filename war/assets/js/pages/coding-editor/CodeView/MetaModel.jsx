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
			elements: {}
		};
		this.init();
		this.getElement = this.getElement.bind(this);
	}

	init() {
		let _this = this;
		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			let entities = resp.items || [];

			let entitiesById = {};
			for (let i = 0; i < entities.length; i++) {


				let element = new MetaModelElement(entities[i].id, entities[i].name, entities[i].type, entities[i].group);

				entitiesById[element.id] = element;
			}

			let mmElements = {};
			for (let id in entitiesById) {
				let entity = entitiesById[id];

				let group = entity.getGroup();

				if (!mmElements.hasOwnProperty(group)) {
					mmElements[group] = [];
				}

				mmElements[group].push(entity);
			}

			_this.setState({
				elements: mmElements
			});

		});
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
		this.setState({
			code: code
		});
	};

	render(){
		return(
			<div>
				<div className= "row">
					<div className="col-sm-6">
						<MetaModelView filter={"PROPERTY"} code={this.state.code}/>
					</div>
					<div className="col-sm-6">
<CodeRelationsView {...this.props} code={this.state.code} getElement={this.getElement}/>
					</div>
				</div>

				<div>
					<a id="btnSaveMetaModelAttr" className="btn btn-default btn-default" >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</div>
			</div>

		);
	}
}