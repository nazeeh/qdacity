import CreateRelationAction from './CreateRelationAction.js';

export default class CreateEdgeAction extends CreateRelationAction {

	getIdentifier() {
		return 'CREATE_' + this.getEdgeType();
	}

	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addEdge(sourceCode, destinationCode, relation, this.getEdgeType());
	}

	getEdgeType() {
		return null;
	}

	removeRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().removeEdge(sourceCode, relation);
	}
}