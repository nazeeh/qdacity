export default class Promisizer {
	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(function(resolve, reject) {
			apiMethod.execute(function(resp) {
				console.log(apiMethod);
				console.log(resp);
				if (!resp.code) {
					resolve(resp);
				} else {
					reject(resp);
				}
			});
		});
		return promise;
	}
}
