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
					if (resp.code===-1){
						new Alert('This Operation is not (yet) supported in offline mode').showModal();
					}
					reject(resp);
				}
			});
		});
		return promise;
	}
}
