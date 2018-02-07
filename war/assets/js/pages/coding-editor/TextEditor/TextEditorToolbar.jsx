import React from 'react';
import styled from 'styled-components';
import { BtnDefault, BtnGroup } from '../../../common/styles/Btn.jsx';
import DropDownButton from '../../../common/styles/DropDownButton.jsx';
import NumberField from '../../../common/styles/NumberField.jsx';

// Toolbar wrapper
const StyledEditorToolbar = styled.div`
	padding: 5px;
	flex: 0 0 auto;
`;

/**
 * Stateless Toolbar component
 */
const TextEditorToolbar = props => {
	const {
		fontFaces,
		fontSize,
		onFontFaceChange,
		onFontSizeChange,
		onBoldClick,
		onItalicClick,
		onUnderlineClick,
	} = props;

	// Create dropdown item data structure from props font list
	const dropDownItems = fontFaces.map(font => ({
		text: font.text,
		onClick: () => onFontFaceChange(font.value),
	}));

	return (
		<StyledEditorToolbar>

			<BtnGroup>
				<BtnDefault onClick={onBoldClick}>
					<i className="fa fa-bold" />
				</BtnDefault>
				<BtnDefault onClick={onItalicClick}>
					<i className="fa fa-italic" />
				</BtnDefault>
				<BtnDefault onClick={onUnderlineClick}>
					<i className="fa fa-underline" />
				</BtnDefault>
			</BtnGroup>

			<BtnGroup>
				<DropDownButton
					initText={'Select a font...'}
					items={dropDownItems}
					fixedWidth={'150px'}
				/>
				<NumberField
					key="fontSizeField"
					onChange={onFontSizeChange}
					value={fontSize}
					style={{ width: '50px' }}
				/>
			</BtnGroup>

		</StyledEditorToolbar>
	);
}

export default TextEditorToolbar;
