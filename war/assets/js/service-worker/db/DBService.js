import idb from 'idb';
import {DB_VERSION} from "../sw";

export default class CodeSystemService {
	constructor() {
	}

	/**
	 *
	 * Opens a store from the database specified by the user id.
	 * Creates it first if it doesnt exist already
	 *
	 * @param userId - the userId, which will be used as database name
	 * @param storeName
	 * @param keyPath - the key of the objects which should be stored in the store
	 * @returns {Promise<DB>}
	 */
	static openAndCreateStoreIfNotExist(userId, storeName, keyPath) {
		return idb.open(userId, DB_VERSION, function (upgradeDB) {
			if (!upgradeDB.objectStoreNames.contains(storeName)) {
				upgradeDB.createObjectStore(storeName, {
					keyPath: keyPath
				});
			}
		});
	}
}
