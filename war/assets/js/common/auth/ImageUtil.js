//@ts-check

export default class ImageUtil {
	constructor() {}

        static scaleToBase64(imgSrc, width, height) {
                const scaleWidth = width; //px
                const scaleHeight = height; //px

                const canvas = document.createElement('canvas');
                canvas.width = scaleWidth;
                canvas.height = scaleHeight;

                const img = new Image();
                img.src = imgSrc
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, scaleWidth, scaleHeight);

                return canvas.toDataURL();
        }
}