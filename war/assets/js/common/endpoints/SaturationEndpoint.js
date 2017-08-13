import Promisizer from './Promisizer'

export default class SaturationEndpoint {
	constructor() {}

	setSaturationParameters(saturationParameters) {
		var apiMethod = gapi.client.qdacity.saturation.setSaturationParameters(saturationParameters);
		return Promisizer.makePromise(apiMethod);
	}
}