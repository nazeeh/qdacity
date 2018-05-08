//import {Store, get, set} from 'idb-keyval';
import idb from 'idb';
import {DB_VERSION} from "../sw";

const STORE_NAMES = {
	PROJECTS: "projects",
	VALIDATION_PROJECTS: "validationProjects"
};
export default class ProjectService {
	constructor() {
	}


	/**
	 * Stores projects from backend in Database
	 *
	 * Clears store projects first
	 * TODO think about that
	 *
	 * @param projectsResponse
	 * @param userId
	 */
	static cacheProjects(projectsResponse, userId) {
		return ProjectService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.PROJECTS);
			projectsResponse.then(projects => {
				for (let project of projects.items) {
					store.put(project);
				}
			});
		});
	}

	static cacheValidationProjects(projectsResponse, userId) {
		return ProjectService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.VALIDATION_PROJECTS).then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS);
			projectsResponse.then(projects => {
				for (let project of projects.items) {
					store.put(project);
				}
			});
		});
	}

	static getProject(userId, params) {
		const projectId = params[0];
		return ProjectService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS);
			console.log(projectId);
			console.log(`tying to get ${projectId} from store...`);
			return store.get(projectId).then(function (val) {
				return ProjectService._resultToResponse(val);
			})
		});
	}

	static getProjects(userId) {
		return ProjectService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS);
			return store.getAll().then(function (items) {
				return ProjectService._listResultToResponse(items);
			})
		});
	}

	static getValidationProjects(userId) {
		return ProjectService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.VALIDATION_PROJECTS).then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS);
			return store.getAll().then(function (items) {
				return ProjectService._listResultToResponse(items);
			})
		});
	}

	static openAndCreateStoreIfNotExist(userId, storeName) {
		return idb.open(userId, DB_VERSION, function (upgradeDB) {
			if (!upgradeDB.objectStoreNames.contains(storeName)) {
				upgradeDB.createObjectStore(storeName, {
					keyPath: 'id'
				});
			}
		});
	}

	static _listResultToResponse(result) {
		const response = {
			items: result,
			result: {
				items: result
			}
		};
		console.log("in listtoReponse: ", response);
		return new Response(JSON.stringify(response), {});
	}
	static _resultToResponse(result) {
		const response = {
			items: result,
			result: {
				items: result
			}
		};
		console.log("in toReponse: ", result);
		return new Response(JSON.stringify(result), {});
	}

}


