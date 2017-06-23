import VexModal from './VexModal';

export default class Alert extends VexModal {

	constructor(message) {
		super();
		this.message = message;
	}

	showModal() {
		vex.dialog.alert(this.message);
	}

}
