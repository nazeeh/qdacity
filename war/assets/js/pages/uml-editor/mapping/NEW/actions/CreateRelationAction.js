import Action from './Action.js';

import {
	Target
} from '../Target.js';

export default class CreateRelationAction extends Action {
	
	execute(target) {
		if (this.getRule().getTargetType() == Target.RELATION) {
			const mapper = this.getRule().getMapper();
			
			const relation = target;
			
			const sourceCode = mapper.getCodeById(relation.key.parent.id);
			const destinationCode = mapper.getCodeByCodeId(relation.codeId);

			this.addRelation(sourceCode, desintationCode, relation);
		}
		else {
			throw new Error('Cant create relation for target type ' + this.getRule().getTargetType());
		}
	}
	
	addRelation(sourceCode, desintationCode, relation) {
		// Do nothing
	}
}