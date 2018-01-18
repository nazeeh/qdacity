export default class EdgeValue {
	constructor(relationId) {
		this.relationId = relationId;
	}

	getRelationId() {
		return this.relationId;
	}

	setRelationId(relationId) {
		this.relationId = relationId;
	}
}
