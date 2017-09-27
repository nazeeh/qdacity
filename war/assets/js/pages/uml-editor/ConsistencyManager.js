export default class ConsistencyManager {

	constructor() {}

	/**
	 * This function is called, when a code was removed from the "outside". If somewhere else in the coding-editor
	 * a code was removed, this function will update the uml-editor.
	 */
	codeRemoved(code) {
		if (this.isCodeMapped(code)) {
			this.removeNode(code);
		}

		this.removePreviousCodeData(code.id);
	}

	/**
	 * Updates the uml-editor after updating a code (or inserting a new code) somewhere else in the coding-editor.
	 * This function compares the code to its latest state (previousCodeData) and determines the changes.
	 */
	codeUpdated(code) {
		const _this = this;

		// Previous code data
		const previousCodeData = this.getPreviousCodeData(code.id);


		// Update name
		if (this.isCodeMapped(code)) {
			this.renameNode(code);
		}


		// Did the MetaModel change?
		const previousMetaModelElementIds = previousCodeData.mmElementIDs;
		const currentMetaModelElementIds = code.mmElementIDs != null ? code.mmElementIDs : [];

		// Sort both arrays to properly find changes or ensure equality
		previousMetaModelElementIds.sort();
		currentMetaModelElementIds.sort();

		// Are both arrays equal?
		let mmElementIdsEqual = (previousMetaModelElementIds.length == currentMetaModelElementIds.length) && previousMetaModelElementIds.every((element, index) => {
			return element == currentMetaModelElementIds[index];
		});

		// Update if the metaModelIDs changed
		if (!mmElementIdsEqual) {
			this.codeMetaModelEntitiesChanged(code, previousMetaModelElementIds);
		}


		// Did the relations change?
		const previousRelations = previousCodeData.relations;
		const currentRelations = code.relations != null ? code.relations : [];

		let removedRelations = [];
		let addedRelations = [];

		previousRelations.forEach((previousRelation) => {
			let exists = false;
			currentRelations.forEach((currentRelation) => {
				if (previousRelation.key.id == currentRelation.key.id) {
					exists = true;
				}
			});

			if (!exists) {
				removedRelations.push(previousRelation);
			}
		});

		currentRelations.forEach((currentRelation) => {
			let exists = false;
			previousRelations.forEach((previousRelation) => {
				if (previousRelation.key.id == currentRelation.key.id) {
					exists = true;
				}
			});

			if (!exists) {
				addedRelations.push(currentRelation);
			}
		});

		removedRelations.forEach((relation) => {
			let sourceCode = code;
			let destinationCode = this.getCodeByCodeId(relation.codeId);

			_this.metaModelRunner.evaluateAndUndoCodeRelation(sourceCode, destinationCode, relation);
		});

		addedRelations.forEach((relation) => {
			let sourceCode = code;
			let destinationCode = this.getCodeByCodeId(relation.codeId);

			_this.metaModelRunner.evaluateAndRunCodeRelation(sourceCode, destinationCode, relation);
		});


		// Set previous code data
		const newPreviousMetaModelElementIds = currentMetaModelElementIds.slice() /*copy*/ ;
		const newPreviousRelations = currentRelations.map(relation => Object.assign({}, relation)) /*copy*/ ;
		this.setPreviousCodeData(code.id, newPreviousMetaModelElementIds, newPreviousRelations);
	}

	/**
	 * Is called if the MetaModel of a code changed during update.
	 */
	codeMetaModelEntitiesChanged(code, previousMetaModelElementIds) {
		// Prepare previousCode
		const previousCode = Object.assign({}, code);
		previousCode.mmElementIDs = previousMetaModelElementIds;

		// Evaluate mapping action
		const previousNodeAction = this.metaModelMapper.evaluateCode(previousCode);
		const currentNodeAction = this.metaModelMapper.evaluateCode(code);

		// Mapping action changed?
		if (previousNodeAction != currentNodeAction) {
			this.metaModelRunner.undoCode(previousNodeAction, code);
			this.metaModelRunner.runCode(currentNodeAction, code);
		}

		// Re-evaluate outgoing relations
		if (code.relations != null) {
			for (let i = 0; i < code.relations.length; i++) {
				let relation = code.relations[i];

				let sourceCode = code;
				let destinationCode = this.getCodeByCodeId(relation.codeId);

				let previousSourceCode = previousCode;
				let previousDestinationCode = destinationCode;

				// Source == Destination
				if (destinationCode.codeID == sourceCode.codeID) {
					previousDestinationCode = previousSourceCode;
				}

				this.checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode);
			}
		}

		// Incoming relations
		this.getCodes().forEach((c) => {
			// Ignore this code
			if (c.codeID != code.codeID) {
				if (c.relations != null) {
					// Check relations
					c.relations.forEach((relation) => {
						if (relation.codeId == code.codeID) {
							let sourceCode = c;
							let destinationCode = code;

							let previousSourceCode = sourceCode;
							let previousDestinationCode = previousCode;

							// Source == Destination
							if (sourceCode.codeID == destinationCode.codeID) {
								previousSourceCode = previousDestinationCode;
							}

							this.checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode);
						}
					});
				}
			}
		});
	}

	/**
	 * Checks if a new mapping can be applied for the relation.
	 */
	checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode) {
		const relationMetaModelId = relation.mmElementId;
		const relationMetaModelEntity = this.getMetaModelEntityById(relationMetaModelId);

		// Evaluate actions
		let oldAction = this.metaModelMapper.evaluateCodeRelation(previousSourceCode, previousDestinationCode, relation);
		let newAction = this.metaModelMapper.evaluateCodeRelation(sourceCode, destinationCode, relation);

		// Execute action
		if (oldAction != newAction) {
			this.metaModelRunner.undoCodeRelation(oldAction, sourceCode, destinationCode, relation);

			this.metaModelRunner.runCodeRelation(newAction, sourceCode, destinationCode, relation);
		}
	}
}