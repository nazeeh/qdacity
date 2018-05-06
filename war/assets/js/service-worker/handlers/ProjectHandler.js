import ProjectService from "../db/ProjectService";
import GoodResponseHandler from "./GoodResponseHandler";

export const listProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] listProjectHandler');
	return fetch(event.request)
		.then(function (response) {
			return GoodResponseHandler.handleGoodResponse(response, event, ProjectService.cacheProjects);
		})
		.catch(function (error) {
			return new Response(JSON.stringify(offlineCode), {});
		});
};