import React from 'react';
import { findDOMNode } from 'react-dom';
import styled from 'styled-components';
import { Data, Range, resetKeyGenerator } from 'slate';
import { Editor } from 'slate-react';
import Html from 'slate-html-serializer';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import SlateCodingBracketAdapter from './SlateCodingBracketAdapter.jsx';
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
	display: grid;
	grid-template-columns: 170px auto;
	flex: 1 1 auto;
	border: 1px solid #888;
	overflow-y: auto;
	position: relative; // important to calculate bracket offsets correctly!
	min-height: 100%;
`;

// Style to use for paragraphs inside the slate editor
const StyledEditorParagraph = styled.p`
	margin: 1em 0;
	background-color: ${props => (props.highlight ? '#c66' : 'initial')};

	/*
	 * When in coding (readonly) mode, the text color is set to transparent
	 * and therefore a text-shadow without offset and blur is displayed.
	 * That way the blinking cursor line is hidden but the text itself is
	 * visible.
	 */
	color: ${props => (props.showCaret ? 'initial' : 'transparent')};
	text-shadow: ${props => (props.showCaret ? 'initial' : '0 0 0 #000')};

	& span::-moz-selection {
		background: transparent;
	}
	& span::selection {
		background: transparent;
	}
`;

// Slate operations that are permitted while in "read-only" Coding-Editor
const readOnlyOperations = [
	'add_mark',
	'remove_mark',
	'set_mark',
	'set_selection',
	'set_value'
];

// Define font list for Toolbar
const fontFaces = [
	{ text: 'use default font', value: null },
	{ text: 'Arial', value: 'Arial, sans-serif' },
	{ text: 'Arial Black', value: 'Arial Black, sans-serif' },
	{ text: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
	{ text: 'Courier New', value: 'Courier New, monospace' },
	{ text: 'Georgia', value: 'Georgia, serif' },
	{ text: 'Impact', value: 'Impact, fantasy' },
	{ text: 'Lucida Console', value: 'Lucida Console, monospace' },
	{ text: 'Palatino Linotype', value: 'Palatino Linotype, serif' },
	{ text: 'Tahoma', value: 'Tahoma, sans-serif' },
	{ text: 'Times New Roman', value: 'Times New Roman, serif' },
	{ text: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
	{ text: 'Verdana', value: 'Verdana, sans-serif' }
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
			/**
			 * Slate Value object of the SlateReact.Editor
			 * See https://docs.slatejs.org/slate-core/value
			 * Value({
			 *   document: Document
			 *   selection: Range,
			 *   history: History,
			 *   schema: Schema,
			 *   data: Data,
			 *   decorations: Immutable.List<Ranges>|Null,
			 * })
			 */
			value: this._htmlSerializer.deserialize('<p></p>'),

			// Default font size to be selected in toolbar
			selectedFontSize: 13
		};

		// Bind public methods to this
		this.setHTML = this.setHTML.bind(this);
		this.getHTML = this.getHTML.bind(this);
		this.setCoding = this.setCoding.bind(this);
		this.removeCoding = this.removeCoding.bind(this);
		this.activateCodingInEditor = this.activateCodingInEditor.bind(this);
		this.isTextEditable = this.isTextEditable.bind(this);
		this.getMaxFalseNeg = this.getMaxFalseNeg.bind(this);
		this.handleSimpleMarkClick = this.handleSimpleMarkClick.bind(this);
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

		this.setState((prevState, props) => {
			// Reset key generator to get consistent Slate node IDs
			resetKeyGenerator();

			// Parse HTML to Slate.Value
			return { value: this._htmlSerializer.deserialize(sanitizedText) };
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
	 * @arg {string} codeID - The ID of the applied code
	 * @arg {string} codeName - The name of the applied code
	 * @arg {string} author - The author for the new coding
	 *
	 * @return {Promise} - Resolves when coding is applied, rejects on error
	 *                     or if nothing is selected
	 */
	setCoding(codeID, codeName, author) {
		// Needed to getting new coding ID from API
		const { projectID, projectType } = this.props;

		// Store selection to be independent of other intermediate changes
		const currentSelection = this.state.value.selection;

		// Do nothing if no range is selected
		if (currentSelection.isCollapsed) {
			return Promise.reject('nothing selected');
		}

		return new Promise((resolve, reject) => {
			// Get new coding ID from API
			ProjectEndpoint.incrCodingId(projectID, projectType)
				.then(({ maxCodingID }) => {
					this.setState(
						prevState => {
							const change = prevState.value.change();
							change.addMarkAtRange(currentSelection, {
								object: 'mark',
								type: 'coding',
								data: Data.create({
									id: maxCodingID,
									code_id: codeID,
									title: codeName,
									author: author
								})
							});
							return {
								value: change.value
							};
						},
						() => {
							resolve(this.getHTML());

							// Force update is needed for the coding brackets to
							// update immediately because they rely on the DOM
							// nodes that are only changed after rendering is
							// complete.
							this.forceUpdate();
						}
					);
				})
				.catch(error => {
					console.log('error while fetching next coding ID');
					reject(error);
				});
		});
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
	 *                     error while fetching a new coding ID from the API
	 *                     or if nothing is selected
	 */
	removeCoding(codeID) {
		// Needed to getting new coding ID from API
		const { projectID, projectType } = this.props;

		// Store parts of the state for queries to be independent of other
		// intermediate changes. MUST NOT BE USED AS BASE FOR STATE UPDATES!
		// Otherwise intermediate changes would be discarded
		const { selection: currentSelection, document } = this.state.value;

		// Do nothing if no range is selected
		if (currentSelection.isCollapsed) {
			return Promise.reject('nothing selected');
		}

		return new Promise((resolve, reject) => {
			// Find codings that should be removed
			const codingsToRemove = document
				.getMarksAtRange(currentSelection)
				.filter(mark => mark.type === 'coding')
				.filter(mark => mark.data.get('code_id') === codeID);

			// Calculate parameters for code splitting if necessary.
			// Returns Immutable.Set
			const splittingPromises = codingsToRemove.map(coding => {
				// Get curried coding searchers
				const findCodingStart = this._findCodingStart.bind(
					this,
					coding.data.get('id')
				);
				const findCodingEnd = this._findCodingEnd.bind(
					this,
					coding.data.get('id')
				);

				// Prepare return value
				const changeParameters = {
					oldCoding: coding
				};

				// Get immediate character before the selection
				const prevChar =
					currentSelection.startOffset === 0
						? // Selection starts at block start
						document
							.getPreviousText(currentSelection.startKey)
							.characters.last()
						: // Selection starts at second character or later
						document
							.getDescendant(currentSelection.startKey)
							.characters.get(currentSelection.startOffset - 1);

				// If character before selection has not the current coding,
				// no splitting is needed
				if (!prevChar.marks.find(m => m.equals(coding))) {
					return changeParameters;
				}

				// Search for the next character after the selection that has
				// not the current coding

				// Start with Text node in which the selection ends
				let textNode = document.getDescendant(currentSelection.endKey);

				// First textNode is only iterated after end of selection
				const characters = textNode.characters.slice(
					currentSelection.endOffset
				);

				// Find first character that has not the current coding
				let endOffset = findCodingEnd(characters);

				// If the immediate next character has not the current coding,
				// no splitting is needed
				if (endOffset === 0) {
					return changeParameters;
				}

				// If other character found, add the selection end offset to
				// get correct character offset in Text node
				if (typeof endOffset !== 'undefined') {
					endOffset += currentSelection.endOffset;
				}

				// If not already found, search subsequent Text nodes
				while (typeof endOffset === 'undefined') {
					textNode = document.getNextText(textNode.key);

					// No Text node left, coding is applied until document end
					if (!textNode) {
						textNode = document.getLastText();
						endOffset = textNode.characters.size;
						break;
					}

					// Find first character that has not the current coding
					endOffset = findCodingEnd(textNode.characters);
				}

				// Get new coding id from API
				return ProjectEndpoint.incrCodingId(projectID, projectType).then(
					({ maxCodingID }) => {
						// Return parameters for coding removal and splitting
						// to have all changes atomically
						return {
							rangeToChange: Range.create({
								anchorKey: currentSelection.endKey,
								anchorOffset: currentSelection.endOffset,
								focusKey: textNode.key,
								focusOffset: endOffset
							}),
							oldCoding: coding,
							newCoding: {
								object: 'mark',
								type: 'coding',
								data: coding.data.set('id', maxCodingID)
							}
						};
					}
				);
			});

			// Wait for all splittings to resolve
			Promise.all(splittingPromises)
				.then(parameters => {
					// Apply all changes atomically
					this.setState(
						prevState => {
							const change = prevState.value.change();

							parameters.map(params => {
								const { rangeToChange, oldCoding, newCoding } = params;

								// Remove mark
								change.removeMarkAtRange(currentSelection, oldCoding);

								// Perform code splitting, if necessary
								if (rangeToChange) {
									// Remove current coding
									change.removeMarkAtRange(rangeToChange, oldCoding);

									// Add coding with new codingID
									change.addMarkAtRange(rangeToChange, newCoding);
								}
							});

							return {
								value: change.value
							};
						},
						() => {
							// Resolve promise with editors current content as HTML
							resolve(this.getHTML());

							// Force update is needed for the coding brackets to
							// update immediately because they rely on the DOM
							// nodes that are only changed after rendering is
							// complete.
							this.forceUpdate();
						}
					);
				})
				.catch(error => {
					console.log('error while fetching next coding ID');
					reject(error);
				});
		});
	}

	/**
	 * Select the first occurence of a a specific coding in the editor,
	 * and optionally scroll it into sight.
	 *
	 * @public
	 * @arg {string} codingID - The Id of the coding to select
	 */
	activateCodingInEditor(codingID) {
		// Find coding and set focus
		const range = this._getCodingRange(codingID);

		// Nothing to highlight if no range found
		if (typeof range === 'undefined') {
			return;
		}

		this.setState(prevState => {
			const change = prevState.value.change();
			change.select(range.set('isFocused', true));
			return {
				value: change.value
			};
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
		return this.state.value.document
			.getBlocks()
			.map(block => block.data.get('falsenegcount'))
			.reduce((max, fnc) => (fnc ? Math.max(max, fnc) : 0), 0);
	}

	/**
	 * Toggle a simple (no metadata) mark on the current selection
	 *
	 * @public
	 * @arg {string} mark - Type of mark to add or remove.  Use 'bold',
	 *                      'italic' or 'underline'.
	 */
	handleSimpleMarkClick(mark) {
		this.setState(prevState => ({
			value: prevState.value.change().toggleMark(mark).value
		}));
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
		const operations = change.operations.map(op => op.type);

		// Only apply change if in textEditable mode or all operations are in
		// readOnlyOperations
		if (
			this.props.textEditable ||
			operations.every(op => readOnlyOperations.includes(op))
		) {
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
		const currentSelection = this.state.value.selection;

		// Nothing selected, return early
		if (currentSelection.isCollapsed) {
			return;
		}

		const newMark =
			font === null
				? null
				: {
					object: 'mark',
					type: 'fontface',
					data: Data.create({
						font
					})
				};

		this.setState(prevState => {
			const change = prevState.value.change();

			// Remove other fontface marks
			prevState.value.document
				.getMarksAtRange(currentSelection)
				.filter(mark => mark.type === 'fontface')
				.forEach(m => change.removeMarkAtRange(currentSelection, m));

			// Apply new mark if set
			if (newMark !== null) {
				change.addMarkAtRange(currentSelection, newMark);
			}

			return {
				value: change.value
			};
		});
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
		const currentSelection = this.state.value.selection;

		// Nothing selected, return early
		if (currentSelection.isCollapsed) {
			return;
		}

		const fontsize = e.target.value;
		const newMark =
			fontsize === ''
				? null
				: {
					object: 'mark',
					type: 'fontsize',
					data: Data.create({
						size: `${fontsize}px`
					})
				};

		this.setState(prevState => {
			const change = prevState.value.change();

			// Remove other fontsize marks
			prevState.value.document
				.getMarksAtRange(currentSelection)
				.filter(m => m.type === 'fontsize')
				.forEach(m => change.removeMarkAtRange(currentSelection, m));

			// Apply new mark if set
			if (newMark !== null) {
				change.addMarkAtRange(currentSelection, newMark);
			}

			return {
				selectedFontSize: fontsize,
				value: change.value
			};
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
		switch (props.mark.type) {
			case 'bold':
				return <Marks.Bold {...props} />;
			case 'coding':
				return <Marks.Coding {...props} />;
			case 'fontface':
				return <Marks.FontFace {...props} />;
			case 'fontsize':
				return <Marks.FontSize {...props} />;
			case 'italic':
				return <Marks.Italic {...props} />;
			case 'selection':
				return (
					<Marks.Selection showCaret={this.props.textEditable} {...props} />
				);
			case 'underline':
				return <Marks.Underline {...props} />;
		}
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
				agreementMapHighlightThreshold: highlightThreshold
			} = this.props;

			// Highlight certain paragraphs if showAgreementMap flag is set
			const highlight =
				showAgreementMap &&
				props.node.data.get('falsenegcount') >= highlightThreshold;

			// All props must be passed for slate to work
			return (
				<StyledEditorParagraph
					highlight={highlight}
					showCaret={this.props.textEditable}
					{...props}
				/>
			);
		}
	}

	/**
	 * Get range of specific coding
	 *
	 * @private
	 * @arg {string} codingID - The ID of the coding to search for
	 * @return {undefined|Slate.Range} - The range where the coding is applied
	 *                                   or undefined if not found at all
	 */
	_getCodingRange(codingID) {
		const document = this.state.value.document;

		// Get curried coding searchers
		const findCodingStart = this._findCodingStart.bind(this, codingID);
		const findCodingEnd = this._findCodingEnd.bind(this, codingID);

		// Start searching for the first mark occurence in first text node
		let startText = document.getFirstText();
		let startOffset = findCodingStart(startText.characters);

		// If not already found, search subsequent Text nodes
		while (typeof startOffset === 'undefined') {
			startText = document.getNextText(startText.key);

			// No Text node left, coding not found
			if (!startText) {
				return;
			}

			startOffset = findCodingStart(startText.characters);
		}

		// Search for the last mark occurence
		let endText = startText;
		let endOffset = findCodingEnd(endText.characters.slice(startOffset));

		// If already found, add the selection end offset to
		// get correct character offset in Text node
		if (typeof endOffset !== 'undefined') {
			endOffset += startOffset;
		}

		// If not already found, search subsequent Text nodes
		while (typeof endOffset === 'undefined') {
			endText = document.getNextText(endText.key);

			// No Text node left, coding is applied until document end
			if (!endText) {
				endText = document.getLastText();
				endOffset = endText.characters.size;
				break;
			}

			endOffset = findCodingEnd(endText.characters);
		}

		return Range.create({
			anchorKey: startText.key,
			anchorOffset: startOffset,
			focusKey: endText.key,
			focusOffset: endOffset
		});
	}

	/**
	 * Find first character in a list of characters that has specific coding
	 *
	 * @private
	 * @arg {string} codingID - The ID of the coding to search for
	 * @arg {Immutable.List} characters - The list of characters to search in
	 * @return {undefined|number} - The character's offset if found, or
	 *                              undefined if no match found
	 */
	_findCodingStart(codingID, characters) {
		return characters.findKey(c =>
			c.marks.find(m => m.type === 'coding' && m.data.get('id') === codingID)
		);
	}

	/**
	 * Find first character in a list of characters that DOES NOT have specific
	 * coding
	 *
	 * @private
	 * @arg {string} codingID - The ID of the coding to search for
	 * @arg {Immutable.List} characters - The list of characters to search in
	 * @return {undefined|number} - The character's offset if found, or
	 *                              undefined if no match found
	 */
	_findCodingEnd(codingID, characters) {
		return characters.findKey(
			c =>
				!c.marks.find(m => m.type === 'coding' && m.data.get('id') === codingID)
		);
	}

	/**
	 * Check if active selection has specific mark
	 *
	 * @private
	 * @arg {string} markType - The mark type to check for
	 * @return {bool} - Wether the active selection has the specified mark
	 */
	_selectionHasMark(markType) {
		return this.state.value.activeMarks.some(m => m.type === markType);
	}

	/**
	 * React main render method.
	 *
	 * @public
	 */
	render() {
		const { value, selectedFontSize } = this.state;

		/*
		 * Create decorations from current selection
		 * It would be cleaner to do this in handleEditorChange(), but that
		 * produces much more lag while dragging a selection.
		 */
		const valueWithSelection = value.change().setValue({
			decorations: value.selection.isCollapsed
				? []
				: [value.selection.set('marks', [{ type: 'selection' }])]
		}).value;

		return (
			<StyledContainer>
				{this.props.textEditable && (
					<TextEditorToolbar
						fontFaces={fontFaces}
						fontSize={selectedFontSize}
						boldActive={this._selectionHasMark('bold')}
						italicActive={this._selectionHasMark('italic')}
						underlineActive={this._selectionHasMark('underline')}
						onFontFaceChange={this.handleFontFaceChange}
						onFontSizeChange={this.handleFontSizeChange}
						onBoldClick={this.handleSimpleMarkClick.bind(this, 'bold')}
						onItalicClick={this.handleSimpleMarkClick.bind(this, 'italic')}
						onUnderlineClick={this.handleSimpleMarkClick.bind(
							this,
							'underline'
						)}
					/>
				)}
				<StyledDocumentWrapper>
					<SlateCodingBracketAdapter
						slateValue={value}
						getCodeByCodeID={this.props.getCodeByCodeID}
						onBracketClick={this.activateCodingInEditor}
					/>
					<Editor
						value={valueWithSelection}
						onChange={this.handleEditorChange}
						renderNode={this.renderNode}
						renderMark={this.renderMark}
					/>
				</StyledDocumentWrapper>
			</StyledContainer>
		);
	}
}
