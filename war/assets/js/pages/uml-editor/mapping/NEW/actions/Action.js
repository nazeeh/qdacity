import CreateNodeAction from './CreateNodeAction.js';

export default class Action {

	static createNode() {		
		return new CreateNodeAction();
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