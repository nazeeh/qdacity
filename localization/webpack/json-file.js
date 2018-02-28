export default class JSONFile {
	constructor(data, replacer = null) {
		this.data = data;
		this.raw = null;
		this.replacer = replacer;
	}

	source() {
		if(this.raw) {
			return this.raw;
		}
		const data = this.data;
		delete this.data;
		return this.raw = JSON.stringify(data, this.replacer, '\t');
	}

	size() {
		return this.source().length;
	}
}