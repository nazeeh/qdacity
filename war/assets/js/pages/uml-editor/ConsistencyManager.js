/**
 * This class updates the uml editor after changes to the codesystem from other components. 
 */
export default class ConsistencyManager {

	constructor(umlEditor) {
		this.umlEditor = umlEditor;

		/**
		 * Stores the data of a code before the latest update. The Data is stored as key-value pairs with the code.id
		 * as key.
		 * Example: A code has the mmElementIDs [1,2,3]. The user updates the code and removes mmElementID 1 => [2,3].
		 * The previousCodeData has still the value [1,2,3]. Then the user updates the code again and adds the 
		 * mmElementID 4 => [2,3,4]. The previousCodeData has the value [2,3] (value after the latest update).
		 */
		this.previousCodeData = {};
	}

	/**
	 * Returns the previous code data for the given code id (code.id, not code.codeID).
	 */
	getPreviousCodeData(codeId) {
		const key = codeId;

		if (!this.previousCodeData.hasOwnProperty(key)) {
			this.previousCodeData[key] = {
				mmElementIDs: [],
				relations: []
			};
		}

		return this.previousCodeData[key];
	}

	/**
	 * Stores the data (mmElementIDs, relations) for the code id.
	 */
	setPreviousCodeData(codeId, mmElementIDs, relations) {
		const key = codeId;

		if (this.previousCodeData.hasOwnProperty(key)) {
			// Set mmElementIDs
			if (mmElementIDs) {
				this.previousCodeData[key].mmElementIDs = mmElementIDs;
			}

			// Set relations
			if (relations) {
				this.previousCodeData[key].relations = relations;
			}
		} else {
			this.previousCodeData[key] = {
				mmElementIDs: mmElementIDs != null ? mmElementIDs : [],
				relations: relations != null ? relations : []
			};
		}
	}

	/**
	 * Initializes the codes after the uml editor finished loading.
	 */
	initializeCode(code) {
		// Code mapping
		this.umlEditor.getMetaModelMapper().execute(code);

		// Initialize previous code data
		const previousMetaModelElementIds = code.mmElementIDs != null ? code.mmElementIDs.slice() /*copy*/ : [];
		const previousRelations = code.relations != null ? code.relations.map(relation => Object.assign({}, relation)) /*copy*/ : [];
		this.setPreviousCodeData(code.id, previousMetaModelElementIds, previousRelations);
	}

	/**
	 * Initializes the code relations after the uml editor finished loading.
	 */
	initializeCodeRelation(relation) {
		this.umlEditor.getMetaModelMapper().execute(relation);
	}

	/**
	 * Deletes a previousCodeData entry.
	 */
	removePreviousCodeData(codeId) {
		const key = codeId;

		if (this.previousCodeData.hasOwnProperty(key)) {
			delete this.previousCodeData[key];
		}
	}

	/**
	 * This function is called, when a code was removed from the "outside". If somewhere else in the coding-editor
	 * a code was removed, this function will update the uml-editor.
	 */
	codeRemoved(code) {
		if (this.umlEditor.isCodeMapped(code)) {
			this.umlEditor.removeNode(code);
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
		if (this.umlEditor.isCodeMapped(code)) {
			this.umlEditor.renameNode(code);
		} else {
			this.umlEditor.unmappedCodeWasRenamed(code);
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
			_this.umlEditor.getMetaModelMapper().undo(relation);
		});

		addedRelations.forEach((relation) => {
			_this.umlEditor.getMetaModelMapper().execute(relation);
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
		const previousNodeActions = this.umlEditor.getMetaModelMapper().evaluateActionsForTarget(previousCode);
		const currentNodeActions = this.umlEditor.getMetaModelMapper().evaluateActionsForTarget(code);

		// Mapping action changed?
		if (!(previousNodeActions.length == currentNodeActions.length && previousNodeActions.every((element, i) => element == currentNodeActions[i]))) {
			this.umlEditor.getMetaModelMapper().undo(previousCode);
			this.umlEditor.getMetaModelMapper().execute(code);
		}

		// Re-evaluate outgoing relations
		if (code.relations != null) {
			for (let i = 0; i < code.relations.length; i++) {
				let relation = code.relations[i];

				let sourceCode = code;
				let destinationCode = this.umlEditor.getCodeByCodeId(relation.codeId);

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
		this.umlEditor.getCodes().forEach((c) => {
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
		let oldRelation = Object.assign({}, relation);
		oldRelation.key.parent.id = previousSourceCode.id;
		oldRelation.codeId = previousDestinationCode.codeID;

		// Evaluate actions
		let oldActions = this.umlEditor.getMetaModelMapper().evaluateActionsForTarget(oldRelation);
		let newActions = this.umlEditor.getMetaModelMapper().evaluateActionsForTarget(relation);

		// Execute action
		if (!(oldActions.length == newActions.length && oldActions.every((element, i) => element == newActions[i]))) {
			this.umlEditor.getMetaModelMapper().undo(oldRelation);
			this.umlEditor.getMetaModelMapper().execute(relation);
		}
	}
}