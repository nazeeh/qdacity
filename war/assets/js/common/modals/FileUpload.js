import VexModal from './VexModal';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class FileUpload extends VexModal {
	constructor(message) {
		super();
		this.message = message;
	}

	showModal() {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			vex.dialog.open({
				contentCSS: {
					width: '500px'
				},
				message: _this.message,
				input:
					'<form action="" method="post" class="filerModal" enctype="multipart/form-data"><input type="file" name="files" id="filer_input" multiple="multiple">    </form>',

				afterOpen: function($vexContent) {
					var filerInput = $vexContent.find('#filer_input');
					const { formatMessage } = IntlProvider.intl;
					filerInput.filer({
						limit: 10,
						maxSize: 3,
						extensions: ['rtf'],
						changeInput: true,
						showThumbs: true,
						captions: {
							errors: {
								filesType: formatMessage({
									id: 'errors.only_rtf',
									defaultMessage: 'Only RTF files are allowed to be uploaded.'
								})
							}
						}
					});
					return $vexContent;
				},
				callback: function(data) {
					if (data) {
						var test = data.files;
						var jFiler = $(this.content)
							.find('#filer_input')
							.prop('jFiler');
						var files = jFiler.files;
						resolve(files);
					}
				}
			});
		});

		return promise;
	}
}
