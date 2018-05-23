import idb from 'idb';
import {DB_VERSION, STORE_NAMES} from "./constants";


export default class DBService {
	constructor() {
	}


	/**
	 *
	 * Opens the database specified by the user id.
	 * Creates the stores if they do not exist already
	 *
	 * @param userId - the userId, which will be used as database name
	 * @returns {Promise<DB>}
	 */
	static openDB(userId) {
		return idb.open(userId, DB_VERSION, function (upgradeDB) {
			for (let storeKey in STORE_NAMES) {
				const store = STORE_NAMES[storeKey];
				if (!upgradeDB.objectStoreNames.contains(store.name)) {
					upgradeDB.createObjectStore(store.name, {
						keyPath: store.key
					});
				}
			}
		});
	}
}
