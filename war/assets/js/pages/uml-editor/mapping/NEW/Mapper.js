export default class Mapper {

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



	exampleForCodeMapping() {
		Rule.create()
			.expect(Target.CODE)
			.require(Condition.or(
				Condition.hasMetaModelEntity('Concept'),
				Condition.hasMetaModelEntity('Category')
			))
			.then(Action.createNodeAction());
	}

	/*
	tests() {
		
		// Map Relation
		MappingRule.create()
			.expect(Expectable.Relation)
			.require(Condition.and(
				Condition.hasMetaModelEntity('is a'),
				Condition.or(
					Condition.hasMetaModelEntity('Concept', Target.Source),
					Condition.hasMetaModelEntity('Category', Target.Source)
				),
				Condition.or(
					Condition.hasMetaModelEntity('Concept', Target.Destination),
					Condition.hasMetaModelEntity('Category', Target.Destination)
				)
			))
			.then(Action.create(Create.Generalization));

		MappingRule.create()
			.expect(Expectable.Relation)
			.require(Condition.and(
				Condition.hasMetaModelEntity('is a'),
				Condition.isValidNode(Target.Source),
				Condition.isValidNode(Target.Destination),
			))
			.then(Action.create(Create.Generalization));
		
		
		MappingRule.create()
			.expect(expectable.Relation)
			.require(Condition.and(
				Condition.hasMetaModelEntity('is related to'),
				Condition.isValidNode(Target.Source),
				Condition.isValidNode(Target.Destination),
			))
			.then(Action.create(Create.ClassField));
		
	}
	*/
}