import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassField extends CreateRelationAction {

	getIdentifier() {
		return 'CREATE_CLASS_FIELD';
	}

	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addClassField(sourceCode, destinationCode, relation);
	}

	removeRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().removeClassField(sourceCode, relation);
	}
}