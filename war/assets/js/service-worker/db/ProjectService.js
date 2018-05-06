import { Store, get, set } from 'idb-keyval';

export default class ProjectService {
	constructor() {}

	static cacheProjects(response, store){
		response.json().then(body => console.log("hola"));
	}

}
