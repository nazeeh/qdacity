
export default class Mapper {
	
	constructor() {
		
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
		
		//... TODO
	}
	
	execute(target) {
		// TODO		
	}
	
	/*
	tests() {
		
		// Map Code
		MappingRule.create()
			.expect(Target.CODE)
			.require(Condition.hasMetaModelEntity('Concept'))
			.then(Action.create(Create.Node));

		MappingRule.create()
			.expect(Target.Code)
			.require(Condition.hasMetaModelEntity('Category'))
			.then(Action.create(Create.Node));

		MappingRule.create()
			.expect(Target.Code)
			.require(Condition.or(
				Condition.hasMetaModelEntity('Concept'),
				Condition.hasMetaModelEntity('Category')
			))
			.then(Action.create(Create.Node));
		
		
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