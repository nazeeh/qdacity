export default class CodeSystemService {
	constructor() {
	}

	/**
	 *
	 * Wraps an array (e.g retrieved from the database) into a Response, that will be used in the Promisizer
	 *
	 * @param result - The array that should be wrapped into a response
	 * @returns {Response}
	 */
	static listResultToResponse(result) {
		const response = {
			items: result,
			result: {
				items: result
			}
		};
		return new Response(JSON.stringify(response), {});
	}

	/**
	 *
	 * Wraps an object (e.g retrieved from the database) into a Response, that will be used in the Promisizer
	 *
	 * @param result - The object that should be wrapped into a response
	 * @returns {Response}
	 */
	static resultToResponse(result) {
		return new Response(JSON.stringify(result), {});
	}

}
