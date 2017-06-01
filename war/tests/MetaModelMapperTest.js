import { EdgeType } from '../assets/js/pages/uml-editor/EdgeType.js';
import MetaModelMapper from '../assets/js/pages/uml-editor/MetaModelMapper.js';

describe("MetaModelMapper", function() {
	
	it('gets correct edge type', function() {
		const metaModel_generalization = { 'name': 'is a' };
		const metaModel_aggregation = { 'name': 'is part of' };
		const metaModel_directed_association = { 'name': 'is related to' };
		
		let expect_gerneralization = MetaModelMapper.getEdgeType(metaModel_generalization)
		let expect_aggregation = MetaModelMapper.getEdgeType(metaModel_aggregation)
		let expect_directed_association = MetaModelMapper.getEdgeType(metaModel_directed_association)
		
		expect(expect_gerneralization).toEqual(EdgeType.GENERALIZATION);
		expect(expect_aggregation).toEqual(EdgeType.AGGREGATION);
		expect(expect_directed_association).toEqual(EdgeType.DIRECTED_ASSOCIATION);
	});
});
