import Rule from '../../../../assets/js/pages/uml-editor/mapping/Rule.js';
import {
	Target
} from '../../../assets/js/pages/uml-editor/mapping/Target.js';
import BaseCondition from '../../../assets/js/pages/uml-editor/mapping/conditions/BaseCondition.js';
import BaseAction from '../../../assets/js/pages/uml-editor/mapping/actions/BaseAction.js';

class TestCondition extends BaseCondition {
	
	evaluate(target) {
		return true;
	}
}

class TestAction extends BaseCondition {
	
	execute(target) {
		return "EXECUTE";
	}
	
	undo(target) {
		return "UNDO";		
	}
}

describe("Rule", function() {

	let rule;
	let target;
	let condition;
	let action;
	
	beforeEach(() => {
		target = Target.CODE;
    	
    	condition = new TestCondition();
    	
    	action = new TestAction();
    	
    	rule = Rule.create()
    		.expect(target)
    		.require(condition)
    		.then(action);
	});

    it("should create a rule object with the given parameters", () => {
    	expect(rule.constructor.name).toBe("Rule");
    	expect(rule.getTargetType()).toBe(target);
    	expect(rule.getCondition()).toBe(condition);
    	expect(rule.getAction()).toBe(action);
    });
    
    it("should evaluate the condition", () => {
    	expect(rule.evaluate()).toBe(true);
    });

    it("should evaluate the condition and execute the action", () => {
    	expect(rule.execute()).toBe("EXECUTE");
    });

    it("should evaluate the condition and undo the action", () => {
    	expect(rule.undo()).toBe("UNDO");
    });
});
