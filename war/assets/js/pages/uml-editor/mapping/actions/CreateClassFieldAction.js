import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassField extends CreateRelationAction {
	getIdentifier() {
		return 'CREATE_CLASS_FIELD';
	}

	addRelation(sourceCode, destinationCode, relation) {
		this.getRule()
			.getMapper()
			.getUmlEditor()
			.addClassField(sourceCode, destinationCode, relation);
	}

	removeRelation(sourceCode, destinationCode, relation) {
		this.getRule()
			.getMapper()
			.getUmlEditor()
			.removeClassField(sourceCode, relation);
	}
}
