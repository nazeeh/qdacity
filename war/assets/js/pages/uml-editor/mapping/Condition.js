import AndCondition from './conditions/AndCondition.js';
import OrCondition from './conditions/OrCondition.js';
import HasMetaModelEntityCondition from './conditions/HasMetaModelEntityCondition.js';

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
		return new HasMetaModelEntityCondition(
			metaModelEntityName,
			evaluationTarget
		);
	}
}
