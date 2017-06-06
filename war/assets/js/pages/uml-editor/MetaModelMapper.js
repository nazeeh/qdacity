import {
	EdgeType
} from './EdgeType.js';

export default class MetaModelMapper {

	constructor(umlEditorView, mmEntities) {
		this.umlEditorView = umlEditorView;
		this.mmEntities = mmEntities;
	}

	mapCode(code) {
		if (this.isValidNode(code)) {
			return this.umlEditorView.addNode(code.name);
		}

		return null;
	}

	isValidNode(code) {
		return this.codeHasMetaModelEntity(code, 'Category') || this.codeHasMetaModelEntity(code, 'Concept');
	}

	mapCodeRelation(metaModelEntity, source, destination) {
		let mode = null;

		let codeSource = source.getCode();
		let codeDestination = destination.getCode();

		switch (metaModelEntity.name) {
		case 'is a':
			{
				if (!this.isValidNode(codeSource) || !this.isValidNode(codeDestination)) { // TODO DUPLICATE CODE?            ;;; SPLIT SWITCH? DIFFERENT FUNCTIONS?
					return;
				}

				mode = EdgeType.GENERALIZATION;
				this.umlEditorView.addEdge(source.getNode(), destination.getNode(), mode);
				break;
			}
		case 'is part of':
			{
				if (!this.isValidNode(codeSource) || !this.isValidNode(codeDestination)) {
					return;
				}

				mode = EdgeType.AGGREGATION;
				this.umlEditorView.addEdge(source.getNode(), destination.getNode(), mode);
				break;
			}
		case 'is related to':
			{
				if (this.codeHasMetaModelEntity(codeDestination, 'Object') || this.codeHasMetaModelEntity(codeDestination, 'Actor') || this.codeHasMetaModelEntity(codeDestination, 'Place')) {
					if (!this.isValidNode(codeSource)) {
						return;
					}

					this.umlEditorView.addClassField(source.getNode(), '+ ' + codeSource.name + ': type');
					return;
				}

				if (!this.isValidNode(codeSource) || !this.isValidNode(codeDestination)) {
					return;
				}

				mode = EdgeType.DIRECTED_ASSOCIATION;
				this.umlEditorView.addEdge(source.getNode(), destination.getNode(), mode);
				break;
			}
		case 'influences':
			{
				if (!this.isValidNode(codeSource)) {
					return;
				}

				this.umlEditorView.addClassMethod(source.getNode(), '+ ' + codeDestination.name + '(type): type');
				break;
			}
		default:
			{
				break;
			}
		}
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