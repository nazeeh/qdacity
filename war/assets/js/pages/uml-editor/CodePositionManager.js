import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

/**
 * This class handles the access to the UmlCodePosition objects from the database. A UmlCodePosition
 * represents the position of a code in the uml-editor. Therefore it has a X and Y coordinate.
 * The positions are stored as key value pairs (key = code.codeID, value = position object).
 */
export default class CodePositionManager {

	constructor() {
		this.codePositions = {};
	}

	/**
	 * Returns a codePosition with the given id from the "client storage" (not from the database).
	 */
	getCodePosition(codeId) {
		const key = codeId;

		if (this.codePositions.hasOwnProperty(key)) {
			return this.codePositions[key];
		}

		return null;
	}

	/**
	 * Creates a new code position object with the given parameters.
	 */
	createCodePositionObject(id, codeId, codesystemId, x, y) {
		return {
			id: id,
			codeId: codeId,
			codesystemId: codesystemId,
			x: x,
			y: y
		};
	}

	/**
	 * Saves the code position with the given key. Is not persisted in the database.
	 */
	setCodePosition(codeId, umlCodePosition) {
		const key = codeId;

		this.codePositions[key] = umlCodePosition;
	}

	/**
	 * Removes the code position from the client storage.
	 */
	removeCodePosition(codeId) {
		const key = codeId;

		if (this.codePositions.hasOwnProperty(key)) {
			delete this.codePositions[key];
		}
	}

	/**
	 * Updates an array of code positions.
	 */
	refreshUmlCodePositions(umlCodePositions) {
		const _this = this;

		if (umlCodePositions != null) {
			umlCodePositions.forEach((umlCodePosition) => {
				_this.setCodePosition(umlCodePosition.codeId, umlCodePosition);
			});
		}
	}

	/**
	 * Returns all code positions with the given codesystemId from the database.
	 */
	listCodePositions(codesystemId, callback) {
		const _this = this;

		UmlCodePositionEndpoint.listCodePositions(codesystemId).then((resp) => {
			let umlCodePositions = resp.items || [];

			_this.refreshUmlCodePositions(umlCodePositions);

			callback(umlCodePositions);
		});
	}

	/**
	 * Inserts or updates a given code position in the database.
	 */
	insertOrUpdateCodePosition(codePosition) {
		let codePositions = [];
		codePositions.push(codePosition);

		this.insertOrUpdateCodePositions(codePositions);
	}

	/**
	 * Inserts or updates multiple code positions in the database.
	 */
	insertOrUpdateCodePositions(codePositions) {
		const _this = this;

		_this.refreshUmlCodePositions(codePositions);

		UmlCodePositionEndpoint.insertOrUpdateCodePositions(codePositions).then((resp) => {
			// ids updated
			_this.refreshUmlCodePositions(resp.items);
		});
	}

	/**
	 * Deletes a code position from the database.
	 */
	deleteCodePosition(codeId) {
		const codePosition = this.getCodePosition(codeId);

		if (codePosition != null) {
			this.removeCodePosition(codeId);

			UmlCodePositionEndpoint.removeCodePosition(codePosition.id).then((resp) => {
				// Do nothing
			});
		}
	}
}