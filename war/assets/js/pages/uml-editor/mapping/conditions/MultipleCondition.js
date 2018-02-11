import BaseCondition from './BaseCondition.js';

export default class MultipleCondition extends BaseCondition {
	constructor(conditions) {
		super();
		this.conditions = conditions;
	}

	setRule(rule) {
		super.setRule(rule);

		// Set rule for children
		if (this.conditions != null && this.conditions.length > 0) {
			for (let i = 0; i < this.conditions.length; i++) {
				this.conditions[i].setRule(rule);
			}
		}
	}

	evaluate(target) {
		let result = true;

		if (this.conditions != null && this.conditions.length > 0) {
			result = this.conditions[0].evaluate(target);

			for (let i = 1; i < this.conditions.length; i++) {
				result = this.compare(result, this.conditions[i].evaluate(target));
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
