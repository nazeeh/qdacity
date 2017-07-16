export default class UmlClassRelation {

	constructor() {
		this.umlClassRelations = [];
	}

	size() {
		return this.umlClassRelations.length;
	}

	getAll() {
		return this.umlClassRelations;
	}

	add(umlClassRelation) {
		this.umlClassRelations.push(umlClassRelation);
	}
}