import React from 'react';
import { findDOMNode } from 'react-dom';
import styled from 'styled-components';
import {
	Data,
	Range,
	resetKeyGenerator,
} from 'slate';
import {
	Editor,
	findDOMNode as findSlateDOMNode,
} from 'slate-react';
import Html from 'slate-html-serializer';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import CodingBrackets from './CodingBrackets.jsx';
import TextEditorToolbar from './TextEditorToolbar.jsx';
import documentSchema from './documentSchema.js';
import Marks from './Marks';

// Container to wrap optional Toolbar and StyledDocumentWrapper
const StyledContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

// Container to wrap columns for Coding Brackets and Slate Editor
const StyledDocumentWrapper = styled.div`
	display: flex;
	flex: 1 1 auto;
	border: 1px solid #888;
	overflow-y: auto;
	position: relative; // important to calculate bracket offsets correctly!
`;

// Column for Coding Brackets
const StyledCodingBracketsContainer = styled.div`
	width: 170px;
	flex: 0 0 auto;
`;

// Column for Slate Editor
const StyledTextEditor = styled.div`
	flex: 1 auto;
`;

// Style to use for paragraphs inside the slate editor
const StyledEditorParagraph = styled.p`
	margin: 1em 0;
	background-color: ${props => props.highlight ? '#c66' : 'initial'};
`;

// Slate operations that are permitted while in "read-only" Coding-Editor
const readOnlyOperations = [
	'add_mark',
	'remove_mark',
	'set_mark',
	'set_selection',
	'set_value',
];

// Define font list for Toolbar
const fontFaces = [
	{ text: 'use default font', value: null },
	{ text: 'Arial', value: 'Arial, sans-serif' },
	{ text: 'Arial Black', value: 'Arial Black, sans-serif' },
	{ text: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
	{ text: 'Courier New', value: 'Courier New, monospace' },
	{ text: 'Georgia', value: 'Georgia, serfi' },
	{ text: 'Impact', value: 'Impact, fantasy' },
	{ text: 'Lucida Console', value: 'Lucida Console, monospace' },
	{ text: 'Palatino Linotype', value: 'Palatino Linotype, serif' },
	{ text: 'Tahoma', value: 'Tahoma, sans-serif' },
	{ text: 'Times New Roman', value: 'Times New Roman, serif' },
	{ text: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
	{ text: 'Verdana', value: 'Verdana, sans-serif' },
];


/**
 * Wrapper component that manages Slate Editor component and provides
 * additional project-specific functionality
 */
export default class TextEditor extends React.Component {

	constructor(props) {
		super(props);

		// Initialize HTML serializer with custom rules
		this._htmlSerializer = new Html({ rules: documentSchema });

		// Initialize state
		this.state = {

			// Empty document
			value: this._htmlSerializer.deserialize('<p></p>'),

			// Default font size to be selected in toolbar
			selectedFontSize: 13,
		}

		// Bind public methods to this
		this.setHTML = this.setHTML.bind(this);
		this.getHTML = this.getHTML.bind(this);
		this.setCoding = this.setCoding.bind(this);
		this.removeCoding = this.removeCoding.bind(this);
		this.activateCodingInEditor = this.activateCodingInEditor.bind(this);
		this.isTextEditable = this.isTextEditable.bind(this);
		this.getMaxFalseNeg = this.getMaxFalseNeg.bind(this);
		this.handleEditorChange = this.handleEditorChange.bind(this);
		this.handleFontFaceChange = this.handleFontFaceChange.bind(this);
		this.handleFontSizeChange = this.handleFontSizeChange.bind(this);
		this.renderMark = this.renderMark.bind(this);
		this.renderNode = this.renderNode.bind(this);
	}

	/**
	 * Set editor content
	 *
	 * @public
	 * @arg {string} html - The HTML string to load into the editor
	 */
	setHTML(html) {
		// Fallback to empty string if html is falsy
		html = html || '';

		// Cleanup the HTMl before parsing it
		const sanitizedText = html
			// Remove trailing <br> tags in each paragraph (added by Squire)
			.replace(/<br><\/p>/g, '</p>')
			// Remove div#svgContainer (added in previous versions)
			.replace(/<div id="svgContainer".*?<\/div>/, '');

		// Parse HTML to Slate.Value
		const newValue = this._htmlSerializer.deserialize(sanitizedText);

		this.setState((prevState, props) => {
			// Reset key generator to get consistent Slate node IDs
			resetKeyGenerator();

			return { value: newValue };
		});
	}

	/**
	 * Get editor content
	 *
	 * @public
	 * @return {string} The current editor content as HTML string
	 */
	getHTML() {
		// Serialize editor value to HTML
		const workaroundHTML = this._htmlSerializer.serialize(this.state.value);

		// Attributes `code_id` and `author` are removed by the serializer
		// and need that workaround. They are serialized to data-code-id and
		// data-author by the serializer and replaced by their original value
		// here.
		return workaroundHTML
			.replace(/(<coding[^>]+?)data-code-id=/g, '$1code_id=')
			.replace(/(<coding[^>]+?)data-author=/g, '$1author=');
	}

	/**
	 * Apply coding to current selection
	 *
	 * @public
	 * @arg {string} codingID - The ID to use for the new coding
	 * @arg {string} codeID - The ID of the applied code
	 * @arg {string} codeName - The name of the applied code
	 * @arg {string} author - The author for the new coding
	 */
	setCoding(codingID, codeID, codeName, author) {
		const change = this.state.value.change();
		change.addMark({
			object: 'mark',
			type: 'coding',
			data: Data.create({
				id: codingID,
				code_id: codeID,
				title: codeName,
				author: author,
			}),
		});

		// Force update is needed for the coding brackets to update immediately
		// because they rely on the DOM nodes that are only changed after
		// rendering is complete.
		this.setState({ value: change.value }, () => this.forceUpdate());
	}

	/**
	 * Remove coding from current selection
	 *
	 * This removes all codings with the given code ID from the current
	 * selection. If the removal leads to two remaining halfs of a coding,
	 * the latter half gets a new coding ID.
	 *
	 * @public
	 * @arg {string} codeID - the ID of the code to remove
	 * @return {Promise} - Waits for all code removals and splittings to be
	 *                     successfully processed. Resolves with the editors
	 *                     current content as HTML. Rejects if there is an
	 *                     error while fetching a new coding ID from the API.
	 */
	removeCoding(codeID) {
		return new Promise((resolve, reject) => {
			// Needed to getting new coding ID from API
			const {
				projectID,
				projectType,
			} = this.props;

			// Find codings that should be removed
			const codingsToRemove = this._getMarksInSelection('coding')
				.filter(mark => mark.data.get('code_id') === codeID);

			// Get editor state and prepare new change
			const value = this.state.value;
			const change = value.change();

			// Remove all matching marks and give new coding IDs to "right"
			// part if coding was split
			const splittingPromises = codingsToRemove.map(coding => {

				// Remove mark
				change.removeMark(coding);

				// === Code splitting ===

				// If character before selection has not the current coding,
				// we do not need code splitting
				let startTextNode = value.startText;
				let previousOffset = value.startOffset - 1;
				if (previousOffset < 0) {
					startTextNode = value.document.getPreviousText(startTextNode.key);
					previousOffset = startTextNode.characters.size - 1;
				}
				if (!startTextNode.characters.get(previousOffset).marks.find(m => m.equals(coding))) {
					return;
				}

				// Start with Text node in which the selection ends
				let textNode = value.endText;

				// Special case: first textNode is only iterated after end of
				// selection.
				// Find first character that has not the current coding
				let endOffset = textNode.characters.slice(value.endOffset)
					.findKey(c => !c.marks.find(m => m.equals(coding)));

				// If the immediate next character has not the current coding,
				// no splitting is needed.
				if (endOffset === 0) {
					return;
				}

				// If character found, add the selection end offset to get
				// correct character offset in Text node
				if (typeof endOffset !== 'undefined') {
					endOffset += value.endOffset;
				}

				// If not already found, search following Text nodes
				while(typeof endOffset === 'undefined') {

					textNode = value.document.getNextText(textNode.key);

					// No Text node left, coding seems to end at document's end
					if (!textNode) {
						textNode = value.document.getLastText();
						endOffset = textNode.characters.size;
						break;
					}

					// Find first character that has not the current coding
					endOffset = textNode.characters
						.findKey(c => !c.marks.find(m => m.equals(coding)));
				}

				// Create a range with the remaining coding part
				const rangeToChange = Range.create({
					anchorKey: value.endText.key,
					anchorOffset: value.endOffset,
					focusKey: textNode.key,
					focusOffset: endOffset,
				});

				// Get new coding id from API
				return ProjectEndpoint.incrCodingId(projectID, projectType)
					.then(({ maxCodingID }) => {

						// Remove current coding
						change.removeMarkAtRange(rangeToChange, coding);

						// Add coding with new codingID
						change.addMarkAtRange(rangeToChange, {
							object: 'mark',
							type: 'coding',
							data: coding.data.set('id', maxCodingID),
						});
					});
			});

			// Wait for all splittings to resolve
			Promise.all(splittingPromises).then(() => {
				this.setState({ value: change.value }, () => {
					// Force update is needed for the coding brackets to
					// update immediately because they rely on the DOM
					// nodes that are only changed after rendering is
					// complete.
					this.forceUpdate();

					// Resolve promise with editors current content as HTML
					resolve(this.getHTML());
				});
			}).catch(errors => {
				console.log('error while fetching next coding ID');
				reject(errors);
			});
		});
	}

	/**
	 * Select the first occurence of a a specific coding in the editor,
	 * and optionally scroll it into sight.
	 *
	 * @public
	 * @arg {string} codingID - The Id of the coding to select
	 * @arg {boolean} scrollToSection - If true the editor attempts to scroll
	 *                                  the selected code into the viewport.
	 *                                  Defaults to false.
	 */
	activateCodingInEditor(codingID, scrollToSection) {
		// Find coding
		const textBlocks = this.state.value.document.getBlocks()
			.map(block => block.getFirstText());
		
		// Iterate over text nodes to find first and last apperance of coding
		// with the given coding id
		const range = textBlocks.reduce((range, text) => {

			// Iterate over text node's characters and find offset and length
			// of first coding apperance
			const result = text.characters.reduce((data, c, offset) => {

				if (c.marks.some(mark => mark.type === 'coding' && mark.data.get('id') === codingID)) {
					// If not yet found the beginning, set it now
					if (typeof data.offset === 'undefined') {
						data.offset = offset;
						data.length = 1;
					} else {
						// Increase length
						data.length += 1;
					}
				}

				return data;

			}, {});

			// If coding was found, create or update range
			if (result.offset > -1) {
				// No start point defined yet, do it now
				if (typeof range.anchorKey === 'undefined') {
					range.anchorKey = text.key;
					range.anchorOffset = result.offset;
				}
				// Set or update end of range.
				range.focusKey = text.key;
				range.focusOffset = result.offset + result.length;
			}

			return range;

		}, { isFocused: true });

		// Prepare change, select the calculated range and update the state.
		const change = this.state.value.change();
		change.select(range);
		this.setState({ value: change.value }, () => {
			// If requested, scroll to the new selection
			if (scrollToSection) {
				// Get the DOM range and try to use the getBoundingClientRect
				// API. This is not available in all older browser versions,
				// so there the feature might not work.
				const domRange = findDOMRange(this.state.value.selection);
				if (domRange.getBoundingClientRect) {
					const y = domRange.getBoundingClientRect().y;
					const scrollContainer = findDOMNode(this.scrollContainer)
					scrollContainer.scrollBy(0, y - scrollContainer.offsetTop);
				}
			}
		});
	}

	/**
	 * Get flag if editor allows editing of text or only allows coding changes.
	 *
	 * @public
	 * @return {boolean} - True if the editor allows editing of text
	 */
	isTextEditable() {
		return this.props.textEditable;
	}

	/**
	 * Get highest false negative count of all paragraphs.
	 *
	 * @public
	 * @return {number} - Highest false negative count. Returns 0 if no
	 *                    false negative counts are set.
	 */
	getMaxFalseNeg() {
		return this.state.value.document.getBlocks()
			.map(block => block.data.get('falsenegcount'))
			.reduce((max, fnc) => fnc ? Math.max(max, fnc) : 0, 0);
	}

	/**
	 * Handle editor changes from Slate Editor component.
	 *
	 * If not in textEditable mode, only subset of changes defined in
	 * readOnlyOperations are applied.
	 *
	 * @public
	 * @arg {Slate.Change} change - The change set to apply.
	 */
	handleEditorChange(change) {
		// Get operation types
		const operations = change.operations.toJS().map(op => op.type);

		// Only apply change if in textEditable mode or all operations are in
		// readOnlyOperations
		if (this.props.textEditable || operations.every(op => readOnlyOperations.includes(op))) {
			this.setState({ value: change.value });
		}
	}

	/**
	 * Change font face of active selection
	 *
	 * Removes all other font faces for the current selection and only applies
	 * the new given font face.
	 *
	 * @public
	 * @arg {null|string} font - The font face to apply. If null, no font face
	 *                           is applied.
	 */
	handleFontFaceChange(font) {
		const change = this.state.value.change();

		// Remove other fontface marks
		this._getMarksInSelection('fontface')
			.forEach(mark => change.removeMark(mark));

		// Apply new font face if set
		if (font !== null) {
			change.addMark({
				object: 'mark',
				type: 'fontface',
				data: Data.create({
					font,
				}),
			});
		}

		this.setState({ value: change.value });
	}

	/**
	 * Change font size of active selection
	 *
	 * Removes all other font sizes for the current selection and only applies
	 * the new given font size. After processing focus() is called on the
	 * event target.
	 *
	 * @public
	 * @arg {Event} e - The DOM event to react to. Expects the event to have
	 *                  property target with properties value (numeric font
	 *                  size as string) and focus (function). Font size is
	 *                  interpreted as pixel value.
	 */
	handleFontSizeChange(e) {
		// Get new font size
		const selectedFontSize = e.target.value;

		const change = this.state.value.change();

		// Remove other fontsize marks
		this._getMarksInSelection('fontsize')
			.forEach(mark => change.removeMark(mark));

		// Apply new font size if set
		if (selectedFontSize !== '') {
			change.addMark({
				object: 'mark',
				type: 'fontsize',
				data: Data.create({
					size: `${selectedFontSize}px`,
				}),
			});
		}

		this.setState({
			selectedFontSize,
			value: change.value,
		});

		// Keep focus in font size input field
		e.target.focus();
	}

	/**
	 * Define rendering components for marks inside the editor
	 * @see {@link https://docs.slatejs.org/walkthroughs/applying-custom-formatting}
	 *
	 * @public
	 * @arg {object} props - The props to pass to the component.
	 */
	renderMark(props) {
		switch(props.mark.type) {
			case 'bold': return <Marks.Bold {...props} />;
			case 'coding': return <Marks.Coding {...props} />;
			case 'fontface': return <Marks.FontFace {...props} />;
			case 'fontsize': return <Marks.FontSize {...props} />;
			case 'italic': return <Marks.Italic {...props} />;
		};
	}

	/**
	 * Define rendering components for (block) nodes inside the editor
	 * @see {@link https://docs.slatejs.org/walkthroughs/applying-custom-formatting}
	 *
	 * @public
	 * @arg {object} props - The props to pass to the component.
	 */
	renderNode(props) {
		if (props.node.type === 'paragraph') {
			const {
				showAgreementMap,
				agreementMapHighlightThreshold: highlightThreshold,
			} = this.props;

			// Highlight certain paragraphs if showAgreementMap flag is set
			const highlight = showAgreementMap
				&& props.node.data.get('falsenegcount') >= highlightThreshold

			// All props must be passed for slate to work
			return (
				<StyledEditorParagraph
					highlight={highlight}
					{...props}
				/>
			);
		}
	}

	/**
	 * Get marks in selection.
	 *
	 * @private
	 * @arg {string} type - If set, only marks with that type are returned.
	 *                      Set to any falsy value to get all marks.
	 * @arg {Slate.Range} range - The range in which to search. Defaults
	 *                            to the editor's current active selection.
	 * @return {Immutable.Set} - Set of marks
	 */
	_getMarksInSelection(type, range) {

		// Default to current selection
		range = range || this.state.value.selection;

		const allMarks = this.state.value.document.getMarksAtRange(range);

		// Optionally filter by mark type
		if (type) {
			return allMarks.filter(mark => mark.type === type);
		} else {
			return allMarks;
		}
	};

	/**
	 * Generator for mark click handlers.
	 *
	 * @private
	 * @arg {string} mark - Type of mark to use in the created event handler.
	 *                      Use 'bold', 'italic' or 'underline'.
	 * @return {function} - Calling that function toggles the specified mark on
	 *                      the editor's current selection.
	 */
	_createMarkClickHandler(mark) {
		return (function() {
			const change = this.state.value.change();
			change.toggleMark(mark);
			this.setState({ value: change.value });
		}).bind(this);
	}

	/**
	 * Get bracket data for rendering the Coding Brackets
	 *
	 * @private
	 * @return {array} - Array of objects, containing bracket data.
	 */
	_getBracketData() {
		// If anything in the processing fails, the rendering might be
		// incomplete
		try {
			// Get all coding's DOM nodes as array
			const domNodeArray = [].slice.call(
				findSlateDOMNode(this.state.value.document)
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

	/**
	 * React main render method.
	 *
	 * @public
	 */
	render() {
		return (
			<StyledContainer>
				{ this.props.textEditable && (
					<TextEditorToolbar
						fontFaces={fontFaces}
						fontSize={this.state.selectedFontSize}
						onFontFaceChange={this.handleFontFaceChange}
						onFontSizeChange={this.handleFontSizeChange}
						onBoldClick={this._createMarkClickHandler('bold')}
						onItalicClick={this._createMarkClickHandler('italic')}
						onUnderlineClick={this._createMarkClickHandler('underline')}
					/>
				) }
				<StyledDocumentWrapper ref={r => this.scrollContainer = r}>
					<StyledCodingBracketsContainer ref={r => this.bracketContainerRef = r}>
						<CodingBrackets
							codingData={this._getBracketData()}
							onBracketClick={this.activateCodingInEditor}
						/>
					</StyledCodingBracketsContainer>
					<StyledTextEditor>
						<Editor
							value={this.state.value}
							onChange={this.handleEditorChange}
							renderNode={this.renderNode}
							renderMark={this.renderMark}
						/>
					</StyledTextEditor>
				</StyledDocumentWrapper>
			</StyledContainer>
		);
	}
}
