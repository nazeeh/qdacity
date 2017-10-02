import CreateRelationAction from './CreateRelationAction.js';

export default class CreateClassField extends CreateRelationAction {

	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addClassField(sourceCode, destinationCode, relation);
	}
}