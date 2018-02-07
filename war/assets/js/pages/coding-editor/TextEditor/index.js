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

// DEBUG STUFF
// TODO remove
import ReactDOM from 'react-dom';
import Slate from 'slate';
import SlateReact from 'slate-react';

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

// Container to wrap columns StyledCodingBracketsContainer, StyledTextEditor
const StyledDocumentWrapper = styled.div`
	display: flex;
	flex: 1 1 auto;
	border: 1px solid #888;
	overflow-y: auto;
	position: relative; // important to calculate bracket offsets correctly!
`;

// Container to hold CodingBrackets
const StyledCodingBracketsContainer = styled.div`
	width: 170px;
	flex: 0 0 auto;
`;

// Container to hold Slate Editor
const StyledTextEditor = styled.div`
	flex: 1 auto;
`;

// style to use for paragraphs inside the slate editor
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


/**
 * Wrapper component that manages Slate Editor component and provides
 * additional project-specific functionality
 */
export default class TextEditor extends React.Component {

	constructor(props) {
		super(props);

		// DEBUG STUFF
		// TODO remove
		window.r = this;
		window.SlateReact = SlateReact;
		window.Html = Html;
		window.ReactDOM = ReactDOM;
		window.Slate = Slate;

		// Initialize HTML serializer with custom rules
		this._htmlSerializer = new Html({ rules: documentSchema });

		// Initialize state
		this.state = {

			// Empty document
			value: this._htmlSerializer.deserialize('<p></p>'),

			// default font size to be selected in toolbar
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
	 * Set editor content.
	 */
	setHTML(html) {
		const sanitizedText = html
			? html.replace(/<br><\/p>/g, '</p>')
				.replace(/<div id="svgContainer".*?<\/div>/, '')
			: '';

		const newValue = this._htmlSerializer.deserialize(sanitizedText);

		this.setState((prevState, props) => {
			resetKeyGenerator();
			return {
				value: newValue,
			};
		});
	}

	/**
	 * Returns the current editor content as HTML
	 */
	getHTML() {
		// attributes `code_id` and `author` are removed by the serializer
		// and need special handling here.
		return this._htmlSerializer
			.serialize(this.state.value)
			.replace(/(<coding[^>]+?)data-code-id=/g, '$1code_id=')
			.replace(/(<coding[^>]+?)data-author=/g, '$1author=');
	}

	/**
	 * Apply coding to current selection
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
		this.setState({ value: change.value }, () => this.forceUpdate());
	}

	/**
	 * Remove coding from current selection
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
				// Start with Text node in which the selection ends
				let textNode = value.endText;

				// If character before selection has not the current coding,
				// we do not need code splitting
				let startTextNode = value.startText;
				let previousOffset = value.startOffset - 1;
				if (previousOffset < 0) {
					startTextNode = value.document.getPreviousText(startTextNode.key);
					previousOffset = startTextNode.characters.size - 1;
				}
				console.log(startTextNode.key, previousOffset);
				if (!startTextNode.characters.get(previousOffset).marks.find(m => m.equals(coding))) {
					return;
				}

				// Special case: first textNode is only iterated from
				// selection end.
				// Find first character that has not the current coding
				let endOffset = textNode.characters.slice(value.endOffset)
					.findKey(c => !c.marks.find(m => m.equals(coding)));

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

				// If selection is zero, return early
				if (value.endText.equals(textNode) && value.endOffset === endOffset) {
					return;
				}

				const rangeToChange = Range.create({
					anchorKey: value.endText.key,
					anchorOffset: value.endOffset,
					focusKey: textNode.key,
					focusOffset: endOffset,
				});

				// Get new coding id
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

			Promise.all(splittingPromises)
				.then(() => {
					this.setState({ value: change.value }, () => {
						this.forceUpdate();
						resolve(this.getHTML());
					});
				})
				.catch(errors => {
					console.log('error while fetching next coding ID');
					reject(errors);
				});
		});
	}

	/**
	 * Select the first occurence of a a specific coding in the editor,
	 * and optionally scroll it into sight
	 */
	activateCodingInEditor(codingID, scrollToSection) {
		// Find coding
		const blocks = this.state.value.document.getBlocks();
		const textBlocks = blocks.map(block => block.nodes.get(0));
		const range = textBlocks.reduce((range, text) => {
			const result = text.characters.reduce((data, c, offset) => {
				if (c.marks.some(mark => mark.type === 'coding' && mark.data.get('id') === codingID)) {
					if (data.offset == -1) {
						data.offset = offset;
					}
					data.length += 1;
				}
				return data;
			}, { offset: -1, length: 0 });
			if (result.offset > -1) {
				if (typeof range.anchorKey === 'undefined') {
					range.anchorKey = text.key;
					range.anchorOffset = result.offset;
				}
				range.focusKey = text.key;
				range.focusOffset = result.offset + result.length;
			}
			return range;
		}, { isFocused: true });

		const change = this.state.value.change();
		change.select(range);
		this.setState({ value: change.value }, () => {
			if (scrollToSection) {
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
	 * Returns if the editor is in textEditable mode, i.e. characters can be
	 * changed. If not, only applying codings and styles is allowed.
	 */
	isTextEditable() {
		return this.props.textEditable;
	}

	getMaxFalseNeg() {
		return this.state.value.document.getBlocks()
			.map(block => block.data.get('falsenegcount'))
			.reduce((max, fnc) => fnc ? Math.max(max, fnc) : 0, 0);
	}

	/**
	 * Handle editor changes from Slate Editor component
	 * Only apply subset of changes if not in textEditable mode
	 */
	handleEditorChange(change) {
		const operations = change.operations.toJS().map(op => op.type);
		if (this.props.textEditable || operations.every(op => readOnlyOperations.includes(op))) {
			this.setState({ value: change.value });
		}
	}

	/**
	 * Change font face of active selection
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
	 */
	renderNode(props) {
		// props must be passed for slate to work
		if (props.node.type === 'paragraph') {
			const {
				showAgreementMap,
				agreementMapHighlightThreshold: highlightThreshold,
			} = this.props;

			const highlight = showAgreementMap
				&& props.node.data.get('falsenegcount') >= highlightThreshold

			return (
				<StyledEditorParagraph
					highlight={highlight}
					{...props}
				/>
			);
		}
	}

	/**
	 * Get Immutable.Set of codings in selection. If argument is omitted the
	 * codings in the current state's selection are returned.
	 */
	_getMarksInSelection(type, selection) {
		selection = selection || this.state.value.selection;
		const allMarks = this.state.value.document.getMarksAtRange(selection);

		if (type) {
			return allMarks.filter(mark => mark.type === type);
		} else {
			return allMarks;
		}
	};

	/**
	 * Generator for mark click handlers. Pass 'bold', 'italic' or 'underline'
	 * to retrieve a event handler that applies the regarding mark to the
	 * editors current selection
	 */
	_createMarkClickHandler(mark) {
		return (function() {
			const change = this.state.value.change();
			change.toggleMark(mark);
			this.setState({ value: change.value });
		}).bind(this);
	}

	_getBracketData() {
		try {
			const domNodeArray = [].slice.call(
				findSlateDOMNode(this.state.value.document)
					.querySelectorAll('span[data-mark-type="coding"]')
			);

			const dataMap = domNodeArray.reduce((data, tag) => {
				const codeID = tag.getAttribute('data-coding-codeid');
				const code = this.props.getCodeByCodeID(codeID);
				const color = code ? code.color : '#000';
				const codingId = tag.getAttribute('data-coding-id');
				const offsetTop = tag.offsetTop;
				const height = tag.offsetHeight;
				if (codingId in data) {
					data[codingId].height = offsetTop - data[codingId].offsetTop + height;
				} else {
					data[codingId] = {
						offsetTop,
						height,
						name: tag.getAttribute('data-coding-title'),
						codingId,
						color,
					};
				}
				return data;
			}, {});

			return Object.values(dataMap);
		} catch(e) {
			// Rendering not finished yet
			return [];
		}
	};

	render() {
		const {
			textEditable,
		} = this.props;

		const {
			value,
			selectedFontSize,
		} = this.state;

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

		return (
			<StyledContainer>
				{ textEditable && (
					<TextEditorToolbar
						fontFaces={fontFaces}
						fontSize={selectedFontSize}
						onFontFaceChange={this.handleFontFaceChange}
						onFontSizeChange={this.handleFontSizeChange}
						onBoldClick={this._createMarkClickHandler('bold')}
						onItalicClick={this._createMarkClickHandler('italic')}
						onUnderlineClick={this._createMarkClickHandler('underline')}
					/>
				) }
				<StyledDocumentWrapper ref={r => this.scrollContainer = r }>
					<StyledCodingBracketsContainer ref={r => this.bracketContainerRef = r }>
						<CodingBrackets
							codingData={this._getBracketData()}
							onBracketClick={this.activateCodingInEditor}
						/>
					</StyledCodingBracketsContainer>
					<StyledTextEditor>
						<Editor
							value={value}
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
