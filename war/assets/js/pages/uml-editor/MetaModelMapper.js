import {
	EdgeType
} from './EdgeType.js';

export default class MetaModelMapper {

	constructor(umlEditorView, mmEntities) {
		this.umlEditorView = umlEditorView;
		this.mmEntities = mmEntities;
	}

	map(metaModelEntity, source, destination) {
		let mode = null;

		let codeSource = source.getCode();
		let codeDestination = destination.getCode();

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
				if (this.codeHasMetaModelEntity(codeDestination, 'Object') || this.codeHasMetaModelEntity(codeDestination, 'Actor') || this.codeHasMetaModelEntity(codeDestination, 'Place')) {
					this.umlEditorView.addClassField(source.getNode(), '+ ' + codeSource.name + ': type');
					return;
				}

				mode = EdgeType.DIRECTED_ASSOCIATION;
				break;
			}
		case 'influences':
			{
				this.umlEditorView.addClassMethod(source.getNode(), '+ ' + codeDestination.name + '(type): type');
				return;
			}
		default:
			{
				return;
			}
		}

		this.umlEditorView.addEdge(source.getNode(), destination.getNode(), mode);
	}

	codeHasMetaModelEntity(code, entityName) {
		if (!code) {
			throw new Error('Code must not be null or undefined');
		}

		for (let mmElementIdKey in code.mmElementIDs) {
			let mmElementId = code.mmElementIDs[mmElementIdKey];
			var entity = this.mmEntities.find((e) => e.id == mmElementId);

			if (entity != null && entity.name == entityName) {
				return true;
			}
		}

		return false;
	}
}