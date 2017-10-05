export default class BaseAction {

	constructor() {
		this.rule = null;
	}

	getRule() {
		return this.rule;
	}

	setRule(rule) {
		this.rule = rule;
	}

	getIdentifier() {
		// Override
	}

	getRequiredTargetType() {
		// Override
	}

	execute(target) {
		this.assertTargetType();
		this.doExecute(target);
	}

	doExecute(target) {
		// Override
	}

	undo(target) {
		this.assertTargetType();
		this.doUndo(target);
	}

	doUndo(target) {
		// Override		
	}

	assertTargetType() {
		const requiredTargetType = this.getRequiredTargetType();
		const targetType = this.getRule().getTargetType();

		if (targetType != requiredTargetType) {
			throw new Error('Invalid target type ' + targetType + '. Expected ' + requiredTargetType + '.');
		}
	}
}