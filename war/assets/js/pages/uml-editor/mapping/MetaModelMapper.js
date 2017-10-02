import {
	Target
} from './Target.js';

export default class MetaModelMapper {

	constructor(umlEditor) {
		this.umlEditor = umlEditor;

		this.rules = {};
	}

	getClassFieldRelationEntityName() {
		return 'is related to';
	}

	getClassMethodRelationEntityName() {
		return 'influences';
	}

	getDefaultUmlClassMetaModelName() {
		return 'Concept';
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
		if (target.hasOwnProperty('codeID') || target.hasOwnProperty('mmElementIDs')) {
			return Target.CODE;	
		}
		else if (target.hasOwnProperty('codeId') || target.hasOwnProperty('mmElementId')) {
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

	evaluateIdentifiers(target, targetType) {
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
					identifiers.push(identifiers);
				}
			}
		}

		return identifiers;
	}
}