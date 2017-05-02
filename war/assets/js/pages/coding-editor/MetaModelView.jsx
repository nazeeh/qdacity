import 'script!../../../../components/Easytabs/jquery.easytabs.js';
import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../common/endpoints/MetaModelRelationEndpoint';
import MetaModelElement from './MetaModelElement';

export default class MetaModelView extends React.Component {
	constructor(props) {
		super(props);

		this.setActiveElement = this.setActiveElement.bind(this);

		this.state = {
			elements: [],
			selected: -1
		};

		this.init();
	}

	setActiveId(elementId) {
		var idFilter = function (el) {
			return el.getId() === elementId;
		}

		var element = this.state.elements.find(idFilter);
		if (typeof element != 'undefined') {
			this.setActiveElement(element);
		} else {
			this.resetSelection();
			this.setState({
				elements: this.state.elements
			});
		}


	}

	setActiveElement(element) {

		this.resetSelection();

		element.toggleSelected();

		this.state.selected = element.getId();

		this.selectGeneralizations(element.getId());

		this.setState({
			elements: this.state.elements
		});
	}

	getActiveElementId() {
		return this.state.selected;
	}

	getElement(pId) {
		var idFilter = function (el) {
			return el.getId() === pId;
		}

		var element = this.state.elements.find(idFilter);

		return element;
	}

	selectGeneralizations(elementID) {
		var _this = this;
		this.state.elements.forEach(function (el) {
			if (el.hasSpecialization(elementID)) {
				el.setSelected(true);
				//recursion
				_this.selectGeneralizations(el.getId());
			}
		});
	}

	resetSelection() {
		this.state.elements.forEach(function (el) {
			el.setSelected(false);
		});
	}

	isActive(value) {
		return ((value == this.state.selected) ? 'selected="selected"' : '');
	}

	init() {
		var _this = this;
		var relationsPromise = MetaModelRelationEndpoint.listRelations(1); // FIXME choose a configurable MM. MM with ID 1 is the default RE MM
		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			var entities = resp.items || [];

			var entitiesById = {};
			for (var i = 0; i < entities.length; i++) {


				var element = new MetaModelElement(entities[i].id, entities[i].name, entities[i].type);
				if (_this.props.filter == entities[i].name) {
					_this.setState({
						selected: element.id
					});
					element.setSelected(true);
				}
				entitiesById[element.id] = element;
			}

			relationsPromise.then(function (resp) {
				var relations = resp.items || [];
				for (var i = 0; i < relations.length; i++) {
					var relation = relations[i];
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
				var mmElements = $.map(entitiesById, function (val) {
					return val;
				});
				_this.setState({
					elements: mmElements
				});
			});
		});
	}

	render() {
		var _this = this;
		var style = {
			width: '250px',
			fontSize: 17
		};



		var firstLevelSelected = -1;

		var firstLevel = this.state.elements.map(function (mmElement) {
			if (mmElement.generalizations.length == 0 && (typeof _this.props.filter == "undefined" || _this.props.filter == mmElement.type)) {

				var attributes = {
					value: mmElement.id,
					onClick: _this.setActiveElement.bind(null, mmElement)
				}

				var classes = "btn btn-default";

				if (mmElement.isSelected()) {
					firstLevelSelected = mmElement.id;
					classes = "btn btn-primary";
				}

				return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>
			} else {
				return null
			}
		})

		var secondLevelSelected = -1;
		var secondLevel = this.state.elements.map(function (mmElement) {
			if (mmElement.hasGeneralization(firstLevelSelected)) {
				var attributes = {
					value: mmElement.id,
					onClick: _this.setActiveElement.bind(null, mmElement)
				}

				var classes = "btn btn-default";

				if (mmElement.isSelected()) {
					classes = "btn btn-primary";
					secondLevelSelected = mmElement.id;
				}

				return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>;
			} else return null;
		})

		var thirdLevel = this.state.elements.map(function (mmElement) {
			var attributes = {
				value: mmElement.id,
				onClick: _this.setActiveElement.bind(null, mmElement)
			}

			var classes = "btn btn-default";

			if (mmElement.isSelected()) {
				classes = "btn btn-primary";
			}

			if (mmElement.hasGeneralization(secondLevelSelected)) return <a key={mmElement.id} {...attributes} className={classes} href="#">{mmElement.name}</a>;
			return null;
		})

		var blockStyle = {
			display: "block"
		};

		var centerStyle = {
			textAlign: "center"
		};

		return (
			<div style={blockStyle}>
      <div style={centerStyle} className="list-group">
      	<div className="btn-group">
      		{firstLevel}
      	</div>
      	<div style={centerStyle} className="list-group">
      		{secondLevel}
	    </div>
	    <div style={centerStyle} className="list-group">
      		{thirdLevel}
	    </div>
      </div>
      </div>
		);
	}

}