import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassMethod extends CreateRelationAction {
	
	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addClassMethod(sourceCode, destinationCode, relation);
	}
}