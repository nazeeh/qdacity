import VexModal from './VexModal';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class Confirm extends VexModal {
	constructor(message) {
		super();
		this.message = message;
		this.updateButtons();
	}

	updateButtons() {
		const { formatMessage } = IntlProvider.intl;
		vex.dialog.buttons.YES.text = formatMessage({
			id: 'modal.ok',
			defaultMessage: 'OK'
		});
		vex.dialog.buttons.NO.text = formatMessage({
			id: 'modal.no',
			defaultMessage: 'Cancel'
		});
	}

	showModal() {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			vex.dialog.confirm({
				message: _this.message,
				callback: function(value) {
					if (value != false) {
						resolve(value);
					} else reject(value);
				}
			});
		});

		return promise;
	}
}
