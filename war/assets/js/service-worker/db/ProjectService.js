import DBService from "./DBService";
import ResponseHelper from "./ResponseHelper";
import { STORE_NAMES } from "./constants";

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
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS.name, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.PROJECTS.name);
			projectsResponse.then(projects => {
				for (let project of projects.items) {
					store.put(project);
				}
			});
		});
	}

	static cacheValidationProjects(projectsResponse, userId) {
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS.name, 'readwrite');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS.name);
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
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS.name, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS.name);
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
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.PROJECTS.name, 'readonly');
			const store = tx.objectStore(STORE_NAMES.PROJECTS.name);
			return store.getAll().then(function (items) {
				return ResponseHelper.listResultToResponse(items);
			})
		});
	}

	static getValidationProjects(userId) {
		return DBService.openDB(userId).then(function (db) {
			const tx = db.transaction(STORE_NAMES.VALIDATION_PROJECTS.name, 'readonly');
			const store = tx.objectStore(STORE_NAMES.VALIDATION_PROJECTS.name);
			return store.getAll().then(function (items) {
				return ResponseHelper.listResultToResponse(items);
			})
		});
	}


}


