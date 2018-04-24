export default class Promisizer {
	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(function(resolve, reject) {
			apiMethod.execute(function(resp) {
				console.log(resp);
				if (!resp.code) {
					resolve(resp);
				} else {
					if(resp.code === -2)
						alert("Function not available");
					reject(resp);
				}
			});
		});
		return promise;
	}
}
