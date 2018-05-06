import ProjectService from "../db/ProjectService";
import ResponseHandler from "./ResponseHandler";

export const listProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] listProjectHandler');
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event, ProjectService.cacheProjects);
		})
		.catch(function (error) {
			return ResponseHandler.handleBadResponse(ProjectService.getProjects).then(function (result) {
				console.log(result);
				return listResultToResponse(result);
			});
		});
};

export const listValidationProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] listProjectHandler');
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event, ProjectService.cacheValidationProjects);
		})
		.catch(function (error) {
			return ResponseHandler.handleBadResponse(ProjectService.getValidationProjects).then(function (result) {
				console.log(result);
				return listResultToResponse(result);
			});
		});
};

function listResultToResponse(result) {
	const response = {
		items: result,
		result: {
			items: result
		}
	};
	console.log("in toReponse: ", response);
	return new Response(JSON.stringify(response), {});
}