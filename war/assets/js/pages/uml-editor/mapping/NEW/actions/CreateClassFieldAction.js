import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassField extends CreateRelationAction {

	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addClassField(sourceCode, destinationCode, relation);
	}

	removeRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().removeClassField(sourceCode, relation);
	}
}