
export default class Rule {

	static create() {
		return new Rule();
	}
	
	constructor() {
		this.targetType = null;
		this.condition = null;
		this.action = null;
		
		this.mapper = null;
	}
	
	getTargetType() {
		return this.targetType;
	}
	
	getCondition() {
		return this.condition;
	}
	
	getAction() {
		return this.action;
	}
	
	getMapper() {
		return this.mapper;
	}
	
	setMapper(mapper) {
		this.mapper = mapper;
	}
	
	expect(targetType) {
		this.targetType = targetType;
		return this;
	}
	
	require(condition) {
		this.condition = condition;
		this.condition.setRule(this);
		return this;
	}
	
	then(action) {
		this.action = action;
		return this;
	}
}