import DBService from "./DBService";
import {STORE_NAMES} from "./constants";
import ResponseHelper from "./ResponseHelper";

export default class CodeSystemService {
	constructor() {
	}


	/**
	 * Stores all codes from the codesystem in the database
	 *
	 * @param codeSystemResponse - the response which should provide an array of codes
	 * @param userId
	 * @returns {Promise<DB>}
	 */
	static cacheCodeSystem(codeSystemResponse, userId) {
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.CODES.name, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.CODES.name);
			codeSystemResponse.then(codes => {
				for (let code of codes.items) {
					store.put(code);
				}
			});
		});
	}

	/**
	 * Retrieve alle codes for the given codesystemid from the database
	 *
	 * @param userId
	 * @param params - an array of params. Should only hold one item: codesystemid(String)
	 * @returns {Promise<Response>}
	 */

	/**
	 *
	 * @param userId
	 * @param params
	 * @returns {Promise<any[]>}
	 */
	static getCodeSystem(userId, params) {
		const codeSystemID = params[0];
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.CODES.name, 'readonly');
			const store = tx.objectStore(STORE_NAMES.CODES.name);
			return store.getAll().then(function (items) {
				return ResponseHelper.wrapArray(items.filter(code => code.codesystemID === codeSystemID));
			})
		});
	}

	/**
	 * Gets the code Ids (not DB Keys!) from the codesystem as List
	 *
	 * @param codesystemId which Codesystem ID
	 * @param user The user who performs the operation
	 * @return A list of Code IDs (not DB Keys!)
	 * @throws UnauthorizedException if user is not authorized to use this
	 * codesystem
	 */
	static getCodeNamesAndIds(userId, codesystemId) {
		const codes = CodeSystemService.getCodeSystem(userId, [codesystemId]);
		let codeIds = {};
		for (code of codes.items) {
			//IMPORTANT: Using CodeId (Actual Code Id) and NOT id (Database Key)
			codeIds[code.name] =  code.codeID;
		}
		return codeIds;
	}
}


