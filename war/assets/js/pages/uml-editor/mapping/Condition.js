import AndCondition from './conditions/AndCondition.js';
import OrCondition from './conditions/OrCondition.js';
import HasMetaModelEntityCondition from './conditions/HasMetaModelEntityCondition.js';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

export default class Condition {

	static and() {
		if (arguments == null || arguments.length < 2) {
			const {formatMessage} = IntlProvider.intl;
			throw new Error(formatMessage({id: 'condition.error', defaultMessage: '{condition} condition requires at least 2 sub-conditions'}, {condition: 'AND'}));
		}

		return new AndCondition(arguments);
	}

	static or() {
		if (arguments == null || arguments.length < 2) {
			const {formatMessage} = IntlProvider.intl;
			throw new Error(formatMessage({id: 'condition.error', defaultMessage: '{condition} condition requires at least 2 sub-conditions'}, {condition: 'OR'}));
		}

		return new OrCondition(arguments);
	}

	static hasMetaModelEntity(metaModelEntityName, evaluationTarget) {
		return new HasMetaModelEntityCondition(metaModelEntityName, evaluationTarget);
	}
}