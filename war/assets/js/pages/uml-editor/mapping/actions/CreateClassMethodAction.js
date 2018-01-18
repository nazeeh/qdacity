import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassMethod extends CreateRelationAction {
	getIdentifier() {
		return 'CREATE_CLASS_METHOD';
	}

	addRelation(sourceCode, destinationCode, relation) {
		this.getRule()
			.getMapper()
			.getUmlEditor()
			.addClassMethod(sourceCode, destinationCode, relation);
	}

	removeRelation(sourceCode, destinationCode, relation) {
		this.getRule()
			.getMapper()
			.getUmlEditor()
			.removeClassMethod(sourceCode, relation);
	}
}
