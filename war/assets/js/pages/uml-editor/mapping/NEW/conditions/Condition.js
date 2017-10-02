import AndCondition from './AndCondition.js';
import OrCondition from './OrCondition.js';
import HasMetaModelEntityCondition from './HasMetaModelEntityCondition.js';

export default class Condition {
	
	static and() {		
		if (arguments == null || arguments.length < 2) {
			throw new Error('AND condition requires at least 2 sub-conditions');
		}
		
		return new AndCondition(arguments);
	}
	
	static or() {	
		if (arguments == null || arguments.length < 2) {
			throw new Error('OR condition requires at least 2 sub-conditions');
		}
		
		return new OrCondition(arguments);		
	}
	
	static hasMetaModelEntity(metaModelEntityName, evaluationTarget) {
		return new HasMetaModelEntityCondition(name, target);
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
	
	evaluate(target) {
		return false;
	}
}