import DBService from "./DBService";
import ResponseHelper from "./ResponseHelper";

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
	 * Puts(Updates) the entries in the projects store and creates new entries if the entry doesnt exist
	 *
	 * @param projectsResponse - The response from the fetch request
	 * @param userId - the database name under which data will be stored
	 */
	static cacheProjects(projectsResponse, userId) {
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS, "id").then(function (db) {
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
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.VALIDATION_PROJECTS, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS);
			projectsResponse.then(projects => {
				for (let project of projects.items) {
					store.put(project);
				}
			});
		});
	}

	/**
	 * Retrieves a single Project from the database
	 * @param userId - The database that is to be searched
	 * @param params - array of paramas. Should contain only one param: projectID(String)
	 * @returns {Promise<Response>}
	 */
	static getProject(userId, params) {
		const projectId = params[0];
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS);
			return store.get(projectId).then(function (val) {
				return ResponseHelper.resultToResponse(val);
			})
		});
	}

	/**
	 * Retrieve all Projects from the database
	 * @param userId - The database that is to be searched
	 * @returns {Promise<Response>}
	 */
	static getProjects(userId) {
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.PROJECTS, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS);
			return store.getAll().then(function (items) {
				return ResponseHelper.listResultToResponse(items);
			})
		});
	}

	static getValidationProjects(userId) {
		return DBService.openAndCreateStoreIfNotExist(userId, STORE_NAMES.VALIDATION_PROJECTS, "id").then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS, 'readonly');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS);
			return store.getAll().then(function (items) {
				return ResponseHelper.listResultToResponse(items);
			})
		});
	}


}


