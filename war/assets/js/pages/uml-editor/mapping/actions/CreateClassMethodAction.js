import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassMethod extends CreateRelationAction {

	getIdentifier() {
		return 'CREATE_CLASS_METHOD';
	}

	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addClassMethod(sourceCode, destinationCode, relation);
	}

	removeRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().removeClassMethod(sourceCode, relation);
	}
}