import { EdgeType } from '../util/EdgeType.js';

import { Target } from './Target.js';

import IntlProvider from '../../../common/Localization/LocalizationProvider';

export default class MetaModelMapper {
	constructor(umlEditor) {
		this.umlEditor = umlEditor;

		this.rules = {};
	}

	getEdgeRelationEntityName(edgeType) {
		const { formatMessage } = IntlProvider.intl;
		switch (edgeType) {
			case EdgeType.GENERALIZATION:
				return formatMessage({
					id: 'metamodelmapper.generalization',
					defaultMessage: 'is a'
				});
			case EdgeType.AGGREGATION:
				return formatMessage({
					id: 'metamodelmapper.aggregation',
					defaultMessage: 'is part of'
				});
			case EdgeType.DIRECTED_ASSOCIATION:
				return formatMessage({
					id: 'metamodelmapper.direct_association',
					defaultMessage: 'is related to'
				});
			default:
				throw new Error(
					formatMessage({
						id: 'metamodelmapper.not_implemented',
						defaultMessage: 'EdgeType is not implemented'
					})
				);
		}
	}

	getClassFieldRelationEntityName() {
		const { formatMessage } = IntlProvider.intl;
		return formatMessage({
			id: 'metamodelmapper.field_relation_entity_name',
			defaultMessage: 'is related to'
		});
	}

	getClassMethodRelationEntityName() {
		const { formatMessage } = IntlProvider.intl;
		return formatMessage({
			id: 'metamodelmapper.method_relation_entity_name',
			defaultMessage: 'influences'
		});
	}

	getDefaultUmlClassMetaModelName() {
		const { formatMessage } = IntlProvider.intl;
		return formatMessage({
			id: 'metamodelmapper.meta_model_name',
			defaultMessage: 'Concept'
		});
	}

	getClassFieldText(relation) {
		const destinationCode = this.getCodeByCodeId(relation.codeId);
		const relationMetaModelElement = this.getMetaModelEntityById(
			relation.mmElementId
		);
		return destinationCode.name + ': ' + relationMetaModelElement.name;
	}

	getClassMethodText(relation) {
		const destinationCode = this.getCodeByCodeId(relation.codeId);
		const relationMetaModelElement = this.getMetaModelEntityById(
			relation.mmElementId
		);

		let methodArguments = null;

		if (methodArguments == null) {
			methodArguments = [];
		}

		return (
			destinationCode.name +
			'(' +
			methodArguments.join(', ') +
			'): ' +
			relationMetaModelElement.name
		);
	}

	getUmlEditor() {
		return this.umlEditor;
	}

	getCodeById(id) {
		return this.umlEditor.getCodeById(id);
	}

	getCodeByCodeId(codeId) {
		return this.umlEditor.getCodeByCodeId(codeId);
	}

	getMetaModelEntityById(metaModelElementId) {
		return this.umlEditor.getMetaModelEntityById(metaModelElementId);
	}

	getTargetType(target) {
		if (
			target.hasOwnProperty('codeID') ||
			target.hasOwnProperty('mmElementIDs')
		) {
			return Target.CODE;
		} else if (
			target.hasOwnProperty('codeId') ||
			target.hasOwnProperty('mmElementId')
		) {
			return Target.RELATION;
		}

		return null;
	}

	registerRule(rule) {
		rule.setMapper(this);

		if (!this.rules.hasOwnProperty(rule.getTargetType())) {
			this.rules[rule.getTargetType()] = [];
		}

		this.rules[rule.getTargetType()].push(rule);
	}

	registerRules(rules) {
		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				this.registerRule(rules[i]);
			}
		}
	}

	execute(target, targetType) {
		if (targetType == null) {
			targetType = this.getTargetType(target);
		}

		const rules = this.rules[targetType];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				rule.execute(target);
			}
		}
	}

	undo(target, targetType) {
		if (targetType == null) {
			targetType = this.getTargetType(target);
		}

		const rules = this.rules[targetType];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				rule.undo(target);
			}
		}
	}

	evaluateActionsForTarget(target, targetType) {
		if (targetType == null) {
			targetType = this.getTargetType(target);
		}

		const rules = this.rules[targetType];

		const identifiers = [];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				if (rule.evaluate(target)) {
					let action = rule.getAction();

					let identifier = action.getIdentifier();
					identifiers.push(identifier);
				}
			}
		}

		return identifiers;
	}
}
