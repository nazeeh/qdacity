export const objectHasKeys = (object, keys) => {
	return keys.every(key => object.hasOwnProperty(key));
};
