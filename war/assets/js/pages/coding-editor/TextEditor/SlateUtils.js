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
 * Calculate paths with their offset and length for a Slate Operation based on
 * the Slate Value and a Slate Range
 *
 * @arg {Slate.Value} value - The value to base the calculation on
 * @arg {Slate.Range} range - The range to convert
 * @return {object[]} array of paths with properties path, offset, length
 */
const rangeToPaths = (value, range) => {
	const doc = value.document;
	const paths = [];

	let textNode;
	do {
		// Get next or first text node
		textNode = textNode
			? doc.getNextText(textNode.key)
			: doc.getDescendant(range.startKey);

		// Offset is range.startOffset for first text node, else node start
		const offset = textNode.key === range.startKey
			? range.startOffset
			: 0;

		// Length is range.endOffset for last text node,
		//           range.endOffset - range.startOffset if single text node,
		//           node length else
		let length;
		if (textNode.key === range.endKey) {
			if (range.endKey === range.startKey) {
				length = range.endOffset - range.startOffset;
			} else {
				length = range.endOffset;
			}
		} else {
			length = textNode.characters.size;
		}

		paths.push({
			path: doc.getPath(textNode.key),
			offset,
			length,
		});
	} while (textNode.key !== range.endKey);

	return paths;
};

/**
 * Create a instance-independent range that uses paths to identify start and
 * end node instead of node keys
 *
 * @arg {Slate.Value} value - Base for the conversion
 * @arg {Slate.Range} range - Range to convert
 * @return {object} Instance-independent range with properties:
 *                  {string[]} anchorPath
 *                  {number} anchorOffset
 *                  {string[]} focusPath
 *                  {number} focusOffset
 */
const rangeToPathRange = (value, range) => {
	const doc = value.document;
	return {
		anchorPath: doc.getPath(range.startKey),
		anchorOffset: range.startOffset,
		focusPath: doc.getPath(range.endKey),
		focusOffset: range.endOffset,
	};
};

/**
 * Convert the instance-independent range to a Slate.Range
 *
 * @arg {Slate.Value} value - Base for the conversion
 * @arg {object} range - Instance-dependent range. Required properties:
 *                       {string[]} anchorPath
 *                       {number} anchorOffset
 *                       {string[]} focusPath
 *                       {number} focusOffset
 * @return {Slate.Range}
 */
const pathRangeToRange = (value, range) => {
	const doc = value.document;
	return Range.create({
		anchorKey: doc.getNodeAtPath(range.anchorPath).key,
		anchorOffset: range.anchorOffset,
		focusKey: doc.getNodeAtPath(range.focusPath).key,
		focusOffset: range.focusOffset,
	});
};

/**
 * Simple proxy for Slate.Operations.invert: Takes a list of Slate Operations
 * and generates a list of reverting operations
 *
 * @arg {Slate.Operation[]|object[]} operations - The operations to invert
 * @return {Slate.Operation[]}
 */
const invertOperations = operations => {
	return operations.map(operation => Operations.invert(operation));
};

/**
 * Apply one ore more operations to Slate.Value
 * @arg {Slate.Value} value
 * @arg {Slate.Operation|Slate.Operation[]} operations
 */
const applyOperations = (value, operations) => {
	const change = value.change();

	if (Array.isArray(operations)) {
		operations.forEach(operation => change.applyOperation(operation));
	} else {
		change.applyOperation(operations);
	}
	
	return change.value;
};

/**
 * Find first character in a list of characters that has specific coding
 *
 * @arg {string} codingID - ID of the coding to search for
 * @arg {Immutable.List} characters - The list of characters to search in
 * @return {undefined|number} - The character's offset if found, or undefined
 *                              if no match found
 */
const findCodingStart = (codingID, characters) => {
	return characters.findKey(c =>
		c.marks.find(m => m.type === 'coding' && m.data.get('id') === codingID)
	);
};

/**
 * Find first character in a list of characters that DOES NOT have specific
 * coding
 *
 * @arg {string} codingID - The ID of the coding to search for
 * @arg {Immutable.List} characters - The list of characters to search in
 * @return {undefined|number} - The character's offset if found, or undefined
 *                              if no match found
 */
const findCodingEnd = (codingID, characters) => {
	return characters.findKey(
		c => !c.marks.find(m => m.type === 'coding' && m.data.get('id') === codingID)
	);
};


const SlateUtils = {
	deserialize,
	serialize,
	rangeToPaths,
	rangeToPathRange,
	pathRangeToRange,
	invertOperations,
	applyOperations,
	findCodingStart,
	findCodingEnd,
};

export default SlateUtils;
