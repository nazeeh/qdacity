
export default class MetaModelMapper {
    
	static getEdgeType(metaModelEntity) {
		let mode = null;
		
		switch (metaModelEntity.name) {
			case 'is a': {
				mode = edgeTypes.GENERALIZATION;
				break;
			}
			case 'is part of': {
				mode = edgeTypes.AGGREGATION;
				break;
			}
			case 'is related to': {
				mode = edgeTypes.DIRECTED_ASSOCIATION;
				break;
			}
			default: {
				// TODO ERROR?
				//alert("error??");
				mode = edgeTypes.ASSOCIATION;
				break;
			}
		}
		
		return mode;
	}
}