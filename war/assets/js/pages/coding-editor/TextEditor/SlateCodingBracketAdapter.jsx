import React from 'react';
import { findDOMNode } from 'slate-react';
import CodingBrackets from './CodingBrackets.jsx';


/**
 * Adapter class to convert a Slate.Value to the generic coding data used by
 * the CodingBrackets Component
 */
export default class SlateCodingBracketAdapter extends React.Component {

	/**
	 * Convert slate value to bracket data for rendering the Coding Brackets
	 *
	 * @private
	 * @arg {Slate.Value} value - The value to convert
	 * @return {array} - Array of objects with bracket data.
	 */
	_convertCodingData(value) {
		// If anything in the processing fails, the rendering might be
		// incomplete
		try {
			// Get all coding's DOM nodes as array
			const domNodeArray = [].slice.call(
				findDOMNode(value.document)
					.querySelectorAll('span[data-mark-type="coding"]')
			);

			// Create bracket data from DOM node information
			const dataMap = domNodeArray.reduce((data, tag) => {
				// Get DOM node attributes and position information
				const codingId = tag.getAttribute('data-coding-id');
				const name = tag.getAttribute('data-coding-title');
				const offsetTop = tag.offsetTop;
				const height = tag.offsetHeight;

				// Get color information from Codesystem and default to black
				const codeID = tag.getAttribute('data-coding-codeid');
				const code = this.props.getCodeByCodeID(codeID);
				const color = code ? code.color : '#000';

				// If coding ID was already found before, extend the bracket
				// height
				if (codingId in data) {
					data[codingId].height = offsetTop - data[codingId].offsetTop + height;
				} else {
					data[codingId] = {
						offsetTop,
						height,
						name,
						codingId,
						color,
					};
				}

				return data;
			}, {});

			// Remove Object keys and return only array of values
			return Object.values(dataMap);

		} catch(e) {
			return [];
		}
	};

	render() {
		const {
			slateValue,
			onBracketClick,
		} = this.props;

		return (
			<CodingBrackets
				codingData={this._convertCodingData(slateValue)}
				onBracketClick={onBracketClick}
			/>
		);
	}
}

