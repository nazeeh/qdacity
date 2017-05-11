import { EdgeType } from '../assets/js/pages/uml-editor/EdgeType.js';
import MetaModelMapper from '../assets/js/pages/uml-editor/MetaModelMapper.js';

describe("MetaModelMapper", function() {
	
	it('gets correct edge type', function() {
		const metaModelEntity = { 'name': 'is a' };
		
		let result = MetaModelMapper.getEdgeType(metaModelEntity)
		
		expect(result).toEqual(EdgeType.GENERALIZATION);
	});
});
