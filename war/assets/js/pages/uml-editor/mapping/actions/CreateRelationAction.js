import Action from './Action.js';

import {
	Target
} from '../Target.js';

export default class CreateRelationAction extends Action {

	getRequiredTargetType() {
		return Target.RELATION;
	}
	
	doExecute(relation) {
		const mapper = this.getRule().getMapper();

		const sourceCode = mapper.getCodeById(relation.key.parent.id);
		const destinationCode = mapper.getCodeByCodeId(relation.codeId);

		this.addRelation(sourceCode, desintationCode, relation);
	}

	addRelation(sourceCode, desintationCode, relation) {
		// Override
	}
	
	doUndo(relation) {
		const mapper = this.getRule().getMapper();

		const sourceCode = mapper.getCodeById(relation.key.parent.id);
		const destinationCode = mapper.getCodeByCodeId(relation.codeId);

		this.removeRelation(sourceCode, desintationCode, relation);
	}
	
	removeRelation(sourceCode, desintationCode, relation) {
		// Override
	}
}