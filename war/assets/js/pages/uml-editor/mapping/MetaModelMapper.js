export default class MetaModelMapper {

	constructor(umlEditor) {
		this.umlEditor = umlEditor;

		this.rules = {};
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

	registerRule(rule) {
		rule.setMapper(this);

		if (!this.rules.hasOwnProperty(rule.getTargetType())) {
			this.rules[rule.getTargetType()] = [];
		}

		this.rules[rule.getTargetType()].push(rule);
	}

	execute(target, targetType) {
		const rules = this.rules[targetType];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				rule.execute(target);
			}
		}
	}

	undo(target, targetType) {
		const rules = this.rules[targetType];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				rule.undo(target);
			}
		}
	}

	getIdentifiers(target, targetType) {
		const rules = this.rules[targetType];

		const identifiers = [];

		if (rules != null) {
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];

				if (rule.evaluate(target)) {
					let action = rule.getAction();

					let identifier = action.getIdentifier(target);
					identifiers.push(identifiers);
				}
			}
		}

		return identifiers;
	}
}