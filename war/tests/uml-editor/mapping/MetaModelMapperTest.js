import Rule from '../../../assets/js/pages/uml-editor/mapping/Rule.js';
import MetaModelMapper from '../../../assets/js/pages/uml-editor/mapping/MetaModelMapper.js';
import {
	Target
} from '../../../assets/js/pages/uml-editor/mapping/Target.js';
import BaseCondition from '../../../assets/js/pages/uml-editor/mapping/conditions/BaseCondition.js';
import BaseAction from '../../../assets/js/pages/uml-editor/mapping/actions/BaseAction.js';

describe("MetaModelMapper", function() {
	
	let metaModelMapper;
	
	beforeEach(() => {
		let umlEditor = null;
		
		metaModelMapper = new MetaModelMapper(umlEditor);
	});

    it("properly registers rules", () => {
		let targetCode = Target.CODE;
		let targetRelation = Target.RELATION;
    	let condition = new BaseCondition();
    	let action = new BaseAction();
    	
    	let rule1 = Rule.create()
    		.expect(targetCode)
    		.require(condition)
    		.then(action);

    	let rule2 = Rule.create()
    		.expect(targetRelation)
    		.require(condition)
    		.then(action);

    	let rule3 = Rule.create()
    		.expect(targetRelation)
    		.require(condition)
    		.then(action);

    	metaModelMapper.registerRule(rule1);

    	expect(metaModelMapper.rules[Target.CODE].length).toBe(1);
    	expect(metaModelMapper.rules[Target.CODE][0]).toBe(rule1);
    	
    	metaModelMapper.registerRules([rule2, rule3]);

    	expect(metaModelMapper.rules[Target.CODE].length).toBe(1);
    	expect(metaModelMapper.rules[Target.RELATION].length).toBe(2);
    	expect(metaModelMapper.rules[Target.RELATION][0]).toBe(rule2);
    	expect(metaModelMapper.rules[Target.RELATION][1]).toBe(rule3);
    });
  
    
    // TODO
  
    // getTargetType
    
    // execute
    
    // undo
    
    // evaluateActionsForTarget
});
