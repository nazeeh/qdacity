export default class BaseCondition {

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