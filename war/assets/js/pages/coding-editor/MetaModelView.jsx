import 'script!../../../../components/Easytabs/jquery.easytabs.js';
import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../common/endpoints/MetaModelRelationEndpoint';
import MetaModelElement from './MetaModelElement';

export default class MetaModelView extends React.Component {

	constructor(props) {
		super(props);

		this.setActiveElement = this.setActiveElement.bind(this);

		this.state = {
			elements: {},
			selected: []
		};

		this.init();
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

		this.state.selected.push(element.getId());

		this.selectGeneralizations(element.getId(), group);

		this.setState({
			elements: this.state.elements
		});
	}

	getActiveElementIds() {
		return this.state.selected;
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

	init() {
		let _this = this;
		let relationsPromise = MetaModelRelationEndpoint.listRelations(1); // FIXME choose a configurable MM. MM with ID 1 is the default RE MM
		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			let entities = resp.items || [];

			let entitiesById = {};
			for (let i = 0; i < entities.length; i++) {


				let element = new MetaModelElement(entities[i].id, entities[i].name, entities[i].type, entities[i].group);
				if (_this.props.filter == entities[i].name) {
					_this.setState({
						selected: element.id
					});
					element.setSelected(true);
				}
				entitiesById[element.id] = element;
			}

			relationsPromise.then(function (resp) {
				let relations = resp.items || [];
				for (let i = 0; i < relations.length; i++) {
					let relation = relations[i];
					switch (relation.type) {
					case "Association":
						break;
					case "Generalization":
						entitiesById[relation.src].addGeneralization(relation.dst);
						entitiesById[relation.dst].addSpecialization(relation.src);
						break;
					default:
						;
					}
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
		});
	}

	render() {
		let _this = this;

		let blockStyle = {
			display: "flex",
			justifyContent: "center"
		};

		return (
			<div style={blockStyle}>
		        {Object.keys(_this.state.elements).map((key, index) => _this.renderGroup(_this.state.elements[key], key))}		        
            </div>
		);
	}

	renderGroup(elements, group) {
		let _this = this;

		let firstLevelSelected = -1;

		let firstLevel = elements.map(function (mmElement) {
			if (mmElement.generalizations.length == 0 && (typeof _this.props.filter == "undefined" || _this.props.filter == mmElement.type)) {

				let attributes = {
					value: mmElement.id,
					onClick: _this.setActiveElement.bind(null, mmElement)
				}

				let classes = "btn btn-default";

				if (mmElement.isSelected()) {
					firstLevelSelected = mmElement.id;
					classes = "btn btn-primary";
				}

				return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>
			} else {
				return null
			}
		})

		let secondLevelSelected = -1;
		let secondLevel = elements.map(function (mmElement) {
			if (mmElement.hasGeneralization(firstLevelSelected)) {
				let attributes = {
					value: mmElement.id,
					onClick: _this.setActiveElement.bind(null, mmElement)
				}

				let classes = "btn btn-default";

				if (mmElement.isSelected()) {
					classes = "btn btn-primary";
					secondLevelSelected = mmElement.id;
				}

				return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>;
			} else return null;
		})

		let thirdLevel = elements.map(function (mmElement) {
			let attributes = {
				value: mmElement.id,
				onClick: _this.setActiveElement.bind(null, mmElement)
			}

			let classes = "btn btn-default";

			if (mmElement.isSelected()) {
				classes = "btn btn-primary";
			}

			if (mmElement.hasGeneralization(secondLevelSelected)) return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>;
			return null;
		})


		let centerStyle = {
			textAlign: "center",
			margin: "0 10px"
		};

		return (
			<div key={"block" + group} style={centerStyle} className="list-group">
                <div key={"firstLevel" + group} className="btn-group">
                    {firstLevel}
                </div>
                <div key={"secondLevel" + group}  style={centerStyle} className="list-group">
                    {secondLevel}
                </div>
                <div key={"thirdLevel" + group}  style={centerStyle} className="list-group">
                    {thirdLevel}
                </div>
		    </div>);
	}

}