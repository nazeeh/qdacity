export default class UmlClassManager {

	constructor() {
		this.umlClasses = [];
	}

	getAll() {
		return this.umlClasses;
	}

	getByCode(code) {
		return this.getByCodeId(code.codeID);
	}

	getByCodeId(codeId) {
		return this.umlClasses.find((umlClass) => umlClass.getCode() != null && umlClass.getCode().codeID == codeId);
	}

	getByNode(node) {
		return this.getByNodeId(node.mxObjectId);
	}

	getByNodeId(mxObjectId) {
		return this.umlClasses.find((umlClass) => umlClass.getNode() != null && umlClass.getNode().mxObjectId == mxObjectId);
	}

	add(umlClass) {
		this.umlClasses.push(umlClass);
	}
}