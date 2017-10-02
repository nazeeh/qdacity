import Action from './Action.js';

import {
	Target
} from '../Target.js';

export default class CreateNodeAction extends Action {

	getRequiredTargetType() {
		return Target.CODE;
	}
	
	doExecute(code) {
		this.getRule().getMapper().getUmlEditor().addNode(code);
	}

	doUndo(code) {
		this.getRule().getMapper().getUmlEditor().removeNode(code);
	}
}