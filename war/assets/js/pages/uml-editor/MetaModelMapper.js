import {
	EdgeType
} from './EdgeType.js';

export default class MetaModelMapper {

	static getEdgeType(metaModelEntity) {
		let mode = null;

		switch (metaModelEntity.name) {
		case 'is a':
			{
				mode = EdgeType.GENERALIZATION;
				break;
			}
		case 'is part of':
			{
				mode = EdgeType.AGGREGATION;
				break;
			}
		case 'is related to':
			{
				mode = EdgeType.DIRECTED_ASSOCIATION;
				break;
			}
		default:
			{
				// TODO ERROR?
				mode = EdgeType.NONE;
				break;
			}
		}

		return mode;
	}
}