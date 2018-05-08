import DBService from "./DBService";
import ResponseHelper from "./ResponseHelper";
import { STORE_NAMES } from "./constants";

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
	static getCodeSystem(userId, params) {
		const codeSystemID = params[0];
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.CODES.name, 'readonly');
			const store = tx.objectStore(STORE_NAMES.CODES.name);
			return store.getAll().then(function (items) {
				const codesOfCodeSystem = items.filter(code => code.codesystemID === codeSystemID);
				return ResponseHelper.listResultToResponse(codesOfCodeSystem);
			})
		});

	}
}


