import CreateRelationAction from './CreateRelationAction.js';

export default class CreateEdgeAction extends CreateRelationAction {
	
	addRelation(sourceCode, desintationCode, relation) {
		this.getRule().getMapper().getUmlEditor().addEdge(sourceCode, destinationCode, relation, this.getEdgeType());
	}
	
	getEdgeType() {
		return null;
	}
}