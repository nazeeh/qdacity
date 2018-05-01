import Alert from '../modals/Alert.js';

export default class Promisizer {
	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(function(resolve, reject) {
			apiMethod.execute(function(resp) {
				console.log(resp);
				if (!resp.code) {
					resolve(resp);
				} else {
					const method = Promisizer.getMethod(apiMethod);
					if (resp.code===-1 && (method === "POST" || method === "DELETE" || method === "PUT")){
						new Alert('This Operation is not (yet) supported in offline mode').showModal();
					}
					reject(resp);
				}
			});
		});
		return promise;
	}

	static getMethod(apiMethod) {
		return apiMethod.Zq.q5;
	}
}
