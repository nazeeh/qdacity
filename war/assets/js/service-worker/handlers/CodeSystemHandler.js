import CodeSystemService from "../db/CodeSystemService";
import ResponseHandler, {RESPONSE} from "./ResponseHandler";


export const getCodeSystemHandler = ({url, event}) => {
	console.log('[ServiceWorker] getCodeSystemHandler');
	return fetch(event.request)
		.then(function (response) {
			return ResponseHandler.handleGoodResponse(response, event, CodeSystemService.cacheCodeSystem);
		})
		.catch(function (error) {
			const codeSystemID = url.pathname.split("/").pop();
			console.log(codeSystemID);
			return ResponseHandler.handleBadResponse(CodeSystemService.getCodeSystem, codeSystemID);
		});
};
