import {
	EdgeType
} from './EdgeType.js';

export default class MetaModelMapper {

	static getEdgeType(metaModelEntity, source, destination, view) {
		let mode = null;

		let relationName = metaModelEntity != null ? metaModelEntity.name : '';
		let sourceName = source.code.mmElement != null ? source.code.mmElement.name : '';
		let destinationName = destination.code.mmElement != null ? destination.code.mmElement.name : '';
		
		switch (relationName) {
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
				if (destinationName == 'Object' || destinationName == 'Actor' || destinationName == 'Place') {
					view.addClassField(source.node, '+ ' + sourceName + ': type');
					return;
				}
				
				mode = EdgeType.DIRECTED_ASSOCIATION;
				break;
			}
		case 'influences':
		{
			view.addClassMethod(source.node, '+ ' + destinationName + '(type): type');
			return;
		}
		default:
			{
				// TODO ERROR?
				mode = EdgeType.NONE;
				break;
			}
		}


		view.addEdge(source.node, destination.node, mode);
		return mode;
	}
}