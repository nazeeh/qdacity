import Rule from '../../../assets/js/pages/uml-editor/mapping/Rule.js';
import {
	Target
} from '../../../assets/js/pages/uml-editor/mapping/Target.js';
import BaseCondition from '../../../assets/js/pages/uml-editor/mapping/conditions/BaseCondition.js';
import BaseAction from '../../../assets/js/pages/uml-editor/mapping/actions/BaseAction.js';


describe("Rule", function() {

    it("should create a rule object with the given parameters", function() {
    	let target = Target.CODE;
    	
    	let condition = new BaseCondition();
    	
    	let action = new BaseAction();
    	
    	let rule = Rule.create()
    		.expect(target)
    		.require(condition)
    		.then(action);

    	expect(rule.constructor.name).toBe("Rule");
    	expect(rule.getTargetType()).toBe(target);
    	expect(rule.getCondition()).toBe(condition);
    	expect(rule.getAction()).toBe(action);
    });
});
