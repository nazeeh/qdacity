import DBService from "./DBService";
import ResponseHandler from "../handlers/ResponseHandler";
import ResponseHelper from "./ResponseHelper";

const STORE_NAMES = {
	CODES: "codes",
};

export default class CodeSystemService {
	constructor() {
	}


	static cacheCodeSystem(codeSystemResponse, userId) {
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.CODES, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.CODES, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.CODES);
			codeSystemResponse.then(codes => {
				for (let code of codes.items) {
					store.put(code);
				}
			});
		});
	}

	static getCodeSystem(userId, params) {
		const codeSystemID = params[0];
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.CODES, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.CODES, 'readonly');
			const store = tx.objectStore(STORE_NAMES.CODES);
			return store.getAll().then(function (items) {
				const codesOfCodeSystem = items.filter(code => code.codesystemID === codeSystemID);
				return ResponseHelper.listResultToResponse(codesOfCodeSystem);
			})
		});

	}
}


