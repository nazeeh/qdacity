import CustomForm from './CustomForm';

export default class TextField {
	constructor(message, placeholder) {
		this.customForm = new CustomForm('');
		this.customForm.addTextField('textBox', message, placeholder, '');
	}

	showModal() {
		var customFormPromise = this.customForm.showModal();

		return new Promise(function(resolve, reject) {
			customFormPromise.then(function(data) {
				resolve(data.textBox);
			});
		});
	}
}
