
export default class Mapper {
	
	constructor() {
		this.rules = [];
	}
	
	getUmlEditor() {
		// TODO
	}
	
	getCodeById(id) {
		// TODO		
	}
	
	getCodeByCodeId(codeId) {
		// TODO		
	}
	
	getMetaModelEntities() {
		// TODO
	}
	
	registerRule(rule) {
		rule.setMapper(this);
		
		this.rules.push(rule);
	}
	
	execute(target) {
		for (let i = 0; i < this.rules.length; i++) {
			const rule = this.rules[i];
			rule.execute(target);
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