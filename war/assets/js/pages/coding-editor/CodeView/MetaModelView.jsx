import MetaModelEntityEndpoint from '../../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../../common/endpoints/MetaModelRelationEndpoint';
import MetaModelElement from './MetaModelElement';

export default class MetaModelView extends React.Component {

	constructor(props) {
		super(props);


		this.state = {
			elements: {},
			selected: []
		};

		this.init();
	}



	getActiveElementIds() {
		return this.props.selected;
	}

	getElement(elementId) {
		let idFilter = function (el) {
			return el.getId() === elementId;
		}

		for (let key in this.props.elements) {
			let element = this.props.elements[key].find(idFilter);

			if (element != null) {
				return element;
			}
		}

		return null;
	}





	init() {
		let _this = this;
		let relationsPromise = MetaModelRelationEndpoint.listRelations(1); // FIXME choose a configurable MM. MM with ID 1 is the default RE MM
		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			let entities = resp.items || [];

			let entitiesById = {};
			for (let i = 0; i < entities.length; i++) {


				let element = new MetaModelElement(entities[i].id, entities[i].name, entities[i].type, entities[i].group);

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
						if (entitiesById.hasOwnProperty(relation.src)) entitiesById[relation.src].addGeneralization(relation.dst);
						if (entitiesById.hasOwnProperty(relation.dst)) entitiesById[relation.dst].addSpecialization(relation.src);
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
				_this.props.setElements(mmElements);
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
		        {Object.keys(_this.props.elements).map((key, index) => _this.renderGroup(_this.props.elements[key], key))}
            </div>
		);
	}

	renderGroup(elements, group) {
		let _this = this;

		let drawFirstLevel = false;

		let firstLevelSelected = -1;

		let firstLevel = elements.map(function (mmElement) {
			if (mmElement.generalizations.length == 0 && (typeof _this.props.filter == "undefined" || _this.props.filter == mmElement.type)) {
				drawFirstLevel = true;

				let attributes = {
					value: mmElement.id,
					onClick: _this.props.updateActiveElement.bind(null, mmElement)
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
					onClick: _this.props.updateActiveElement.bind(null, mmElement)
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
				onClick: _this.props.updateActiveElement.bind(null, mmElement)
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
			margin: "0 7px"
		};

		if (drawFirstLevel) {
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
		} else {
			return null;
		}
	}

}