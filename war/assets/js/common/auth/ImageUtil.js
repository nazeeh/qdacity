//@ts-check

export default class ImageUtil {
	constructor() {}

	/**
	 * @returns {Promise}
	 */
	static scaleToBase64(imgSrc, width, height) {
		const promise = new Promise(function(resolve, reject) {
			const scaleWidth = width; //px
			const scaleHeight = height; //px

			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.width = scaleWidth;
			canvas.height = scaleHeight;

			const img = new Image();
			img.onload = function() {
				context.drawImage(img, 0, 0, scaleWidth, scaleHeight);
				resolve(canvas.toDataURL());
			};
			img.src = imgSrc;
			img.setAttribute('crossOrigin', 'anonymous');
		});
		return promise;
	}
}
