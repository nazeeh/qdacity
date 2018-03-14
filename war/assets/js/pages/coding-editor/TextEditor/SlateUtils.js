import {
	Operations,
	resetKeyGenerator,
} from 'slate';
import Html from 'slate-html-serializer';
import documentSchema from './documentSchema.js';


// Initialize html serializer instance.
const htmlSerializer = new Html({ rules: documentSchema });

/**
 * Deserialize HTML string to Slate Value
 *
 * @arg {string} html
 * @return {Slate.Value}
 */
const deserialize = html => {
	// Fallback to empty string if html is falsy
	html = html || '';

	// Cleanup the HTMl before parsing it
	const sanitizedText = html
		// Remove trailing <br> tags in each paragraph (added by Squire)
		.replace(/<br><\/p>/g, '</p>')
		// Remove div#svgContainer (added in previous versions)
		.replace(/<div id="svgContainer".*?<\/div>/, '');

	// Reset key generator to get consistent Slate node IDs
	resetKeyGenerator();

	// Parse HTML to Slate.Value
	return htmlSerializer.deserialize(sanitizedText);
};

/**
 * Serialize Slate Value to HTML string
 *
 * @arg {Slate.Value} value
 * @return {string}
 */
const serialize = value => {
	// Serialize editor value to HTML
	const workaroundHTML = htmlSerializer.serialize(value);

	// Attributes `code_id` and `author` are removed by the serializer
	// and need that workaround. They are serialized to data-code-id and
	// data-author by the serializer and replaced by their original value
	// here.
	return workaroundHTML
		.replace(/(<coding[^>]+?)data-code-id=/g, '$1code_id=')
		.replace(/(<coding[^>]+?)data-author=/g, '$1author=');
};

/**
 * Calculate the path, offset and length for a Slate Operation based on the
 * Slate Value and a Slate Range
 *
 * @arg {Slate.Value} value - The value to base the calculation on
 * @arg {Slate.Range} range - The range to convert
 * @return {object} with properties path, offset, length
 */
const rangeToPath = (value, range) => {
	const doc = value.document;

	// path is an array of indices
	const path = doc.getPath(range.startKey);
	const offset = range.startOffset;
	let length = 0;

	// Simple case: range is inside a single text node (=paragraph)
	if (range.startKey === range.endKey) {

		length = range.endOffset - offset;

	// Range spans over multiple text nodes.
	} else {

		// Get first text node and add characters from range start to node end
		let node = doc.getDescendant(range.startKey);
		length += node.characters.size - offset;

		// Iterate through the start text node and the following nodes
		while (node = doc.getNextText(node.key)) {

			// Found last node of range, add node start to range end
			if (node.key === range.endKey) {
				length += range.endOffset;
				break;

			// Found node in between, add full node length
			} else {
				length += node.characters.size;
			}
		}
	}

	return {
		path,
		offset,
		length,
	};
};

/**
 * Simple proxy for Slate.Operations.invert: Takes a Slate Operation and
 * generates a reverting operation
 *
 * @arg {Slate.Operation|object} operation - The operation to invert
 * @return {Slate.Operation}
 */
const invertOperation = Operations.invert;

const SlateUtils = {
	deserialize,
	serialize,
	rangeToPath,
	invertOperation,
};

export default SlateUtils;
