export default class ResponseHelper {
	constructor() {
	}

	/**
	 *
	 * Wraps an array (e.g retrieved from the database) into an Object with the array is items property
	 *
	 * @param result - The array that should be wrapped
	 * @return
	 */
	static wrapArray(result) {
		return {
			items: result,
			result: {
				items: result
			}
		};
	}

}
