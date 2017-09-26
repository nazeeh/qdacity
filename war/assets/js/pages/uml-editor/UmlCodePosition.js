export default class UmlCodePosition {

	constructor() {
		this.codeId = null;

		this.codesystemId = null;

		this.x = 0;

		this.y = 0;
	}

	getCodeId() {
		return this.codeId;
	}

	setCodeId(codeId) {
		this.codeId = codeId;
	}

	getCodesystemId() {
		return this.codesystemId;
	}

	setCodesystemId(codesystemId) {
		this.codesystemId = codesystemId;
	}

	getX() {
		return this.x;
	}

	setX(x) {
		this.x = x;
	}


	getY() {
		return this.y;
	}

	setY(y) {
		this.y = y;
	}
}