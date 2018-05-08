import ProjectService from "../db/ProjectService";
import ResponseHandler from "./ResponseHandler";

export const listProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] listProjectHandler');
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event, ProjectService.cacheProjects);
		})
		.catch(function (error) {
			return ResponseHandler.handleBadResponse(ProjectService.getProjects);
		});
};

export const listValidationProjectHandler = ({url, event}) => {
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event, ProjectService.cacheValidationProjects);
		})
		.catch(function (error) {
			return ResponseHandler.handleBadResponse(ProjectService.getValidationProjects);
		});
};

export const getProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] getProjectHandler', event);
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event);
		})
		.catch(function (error) {
			const projectId = url.searchParams.get("id");
			return ResponseHandler.handleBadResponse(ProjectService.getProject, projectId);
		});
};
