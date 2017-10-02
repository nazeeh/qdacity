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
	
	static createGeneralizationAction() {
		return new CreateEdgeGeneralizationAction();		
	}
	
	static createAggregationAction() {
		return new CreateEdgeAggregationAction();	
	}
	
	static createDirectedAssociationAction() {
		return new CreateEdgeDirectedAssociationAction();	
	}
	
	static createClassFieldAction() {
		return new CreateClassFieldAction();	
	}
	
	static createClassMethodAction() {
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