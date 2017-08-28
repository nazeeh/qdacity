import VexModal from './VexModal';

export default class Confirm extends VexModal {

	constructor(message) {
		super();
		this.message = message;
	}

	showModal() {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
				vex.dialog.confirm({
					message: _this.message,
					callback: function (value) {
						if (value != false) {
							resolve(value);
						} else reject(value);
					}
				});
			}
		);

		return promise;
	}

}