import VexModal from './VexModal';

export default class TextField extends VexModal {

	constructor(message, placeholder) {
		super();
		this.message = message;
		this.placeholder = placeholder;
	}

	showModal() {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				var formElements = "<textarea placeholder=\"" + _this.placeholder + "\" rows=\"15\" cols=\"200\" name=\"textBox\" type=\"text\"  ></textarea><br/>\n";

				vex.dialog.open({
					message: _this.message,
					contentCSS: {
						width: '600px'
					},
					input: formElements,
					buttons: [$.extend({}, vex.dialog.buttons.YES, {
						text: 'OK'
					}), $.extend({}, vex.dialog.buttons.NO, {
						text: 'Cancel'
					})],
					callback: function (data) {

						if (data != false) {
							resolve(data.textBox);
						} else reject(data.textBox);
					}
				});
			}
		);

		return promise;
	}

}