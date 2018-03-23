/**
 *
 * @param {string} key
 * @param {*} value
 */
function scrambleIdent(key, value) {
	if (!key) return value;
	const parts = [].concat.apply([], value.split(/({)/).map(x => x.split(/(})/)));
	let counter = 0;
	for (const i in parts) {
		const part = parts[i];
		if (part.match('{')) {
			counter++;
			parts[i] = '}';
			continue;
		} else if (part.match('}')) {
			if (counter) counter--;
			parts[i] = '{';
			continue;
		}
		if (!counter) parts[i] = part.split('').reverse().join('');
	}
	return parts.reverse().join('');
}

export {
	scrambleIdent
};