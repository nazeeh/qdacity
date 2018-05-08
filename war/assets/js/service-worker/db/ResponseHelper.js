export default class CodeSystemService {
	constructor() {
	}

	static listResultToResponse(result) {
		const response = {
			items: result,
			result: {
				items: result
			}
		};
		return new Response(JSON.stringify(response), {});
	}

	static resultToResponse(result) {
		return new Response(JSON.stringify(result), {});
	}

}
