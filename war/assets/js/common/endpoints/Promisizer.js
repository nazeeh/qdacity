import Alert from '../modals/Alert.js';
import IntlProvider from '../Localization/LocalizationProvider';

export default class Promisizer {
	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(function(resolve, reject) {
			apiMethod.execute(function(resp) {
				console.log("Response in Prmoiszer ", resp , " for ", apiMethod);
				if (!resp.code) {
					resolve(resp);
				} else {
					const method = Promisizer.getMethod(apiMethod);
					if (resp.code === -1 && (method === "POST" || method === "DELETE" || method === "PUT")){
						const { formatMessage } = IntlProvider.intl;
						const alertMessage = formatMessage({
							id: 'modal.offline_unsupported',
							defaultMessage: 'Operation currently not supported in offline mode'
						});
						new Alert(alertMessage).showModal();
					}
					reject(resp);
				}
			});
		});
		return promise;
	}

	static getMethod(apiMethod) {
		return apiMethod.Zq.k5.method;
	}
}
