import BaseCondition from './BaseCondition.js';

export default class MultipleCondition extends BaseCondition {

	constructor(conditions) {
		this.conditions = conditions;
	}

	setRule(rule) {
		super.setRule(rule);

		// Set rule for children
		if (conditions != null && conditions.length > 0) {
			for (let i = 0; i < this.conditions.length; i++) {
				this.conditions[i].setRule(rule);
			}
		}
	}

	evaluate(target) {
		let result = true;

		if (conditions != null && conditions.length > 0) {
			result = conditions[0].execute(target);

			for (let i = 1; i < this.conditions.length; i++) {
				result = this.compare(result, conditions[i].execute(target));
			}
		}

		return result;
	}

	/**
	 * Override this method.
	 */
	compare(resultA, resultB) {
		return null;
	}
}