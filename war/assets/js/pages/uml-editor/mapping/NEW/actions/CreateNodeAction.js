import Action from './Action.js';

import {
	Target
} from '../Target.js';

export default class CreateNodeAction extends Action {
	
	execute(target) {
		if (this.getRule().getTargetType() == Target.CODE) {
			const code = target;
			this.getRule().getMapper().getUmlEditor().addNode(code);
		}
		else {
			throw new Error('Cant create node for target type ' + this.getRule().getTargetType());
		}
	}
}