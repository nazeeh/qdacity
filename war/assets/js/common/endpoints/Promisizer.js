export default class Promisizer {
	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(function(resolve, reject) {
			apiMethod.execute(function(resp) {
				console.log("mal schaun ", apiMethod);
				if (!resp.code) {
					resolve(resp);
				} else {
					console.log(resp.code + ' : ' + resp.message);
					reject(resp);
				}
			});
		});
		return promise;
	}
}
