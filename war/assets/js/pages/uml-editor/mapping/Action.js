import CreateNodeAction from './actions/CreateNodeAction.js';
import CreateEdgeGeneralizationAction from './actions/CreateEdgeGeneralizationAction.js';
import CreateEdgeAggregationAction from './actions/CreateEdgeAggregationAction.js';
import CreateEdgeDirectedAssociationAction from './actions/CreateEdgeDirectedAssociationAction.js';
import CreateClassFieldAction from './actions/CreateClassFieldAction.js';
import CreateClassMethodAction from './actions/CreateClassMethodAction.js';

export default class Action {

	static createNode() {
		return new CreateNodeAction();
	}

	static createGeneralization() {
		return new CreateEdgeGeneralizationAction();
	}

	static createAggregation() {
		return new CreateEdgeAggregationAction();
	}

	static createDirectedAssociation() {
		return new CreateEdgeDirectedAssociationAction();
	}

	static createClassField() {
		return new CreateClassFieldAction();
	}

	static createClassMethod() {
		return new CreateClassMethodAction();
	}
}