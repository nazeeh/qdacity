import CreateNodeAction from './CreateNodeAction.js';
import CreateEdgeGeneralizationAction from './CreateEdgeGeneralizationAction.js';
import CreateEdgeAggregationAction from './CreateEdgeAggregationAction.js';
import CreateEdgeDirectedAssociationAction from './CreateEdgeDirectedAssociationAction.js';
import CreateClassFieldAction from './CreateClassFieldAction.js';
import CreateClassMethodAction from './CreateClassMethodAction.js';

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

	constructor() {
		this.rule = null;
	}

	getRule() {
		return this.rule;
	}

	setRule(rule) {
		this.rule = rule;
	}

	execute(target) {
		// Do nothing
	}
}