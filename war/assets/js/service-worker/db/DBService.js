import idb from 'idb';
import {DB_VERSION} from "../sw";

export default class CodeSystemService {
	constructor() {
	}

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
