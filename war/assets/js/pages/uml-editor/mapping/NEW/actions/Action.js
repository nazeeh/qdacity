import CreateNodeAction from './CreateNodeAction.js';

export default class Action {

	static createNode() {		
		return new CreateNodeAction();
	}
	
	constructor() {
		
	}
	
	execute(target) {
		// Do nothing
	}
}