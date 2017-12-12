import React from 'react'
import styled from 'styled-components';

import {
	PageView
} from './View/PageView.js';


const StyledContainer = styled.div `
	position: relative;
`;

const StyledTextEditor = styled.iframe `
	height: ${props => {
		let codingViewOffset = props.showCodingView ? '350px' : '51px'
		let menuOffset = (props.selectedEditor === PageView.TEXT) ? '44px' : '0px'
		return 'calc(100vh - '+menuOffset+' - '+codingViewOffset+')';
	}} !important;
	display: ${props => (props.selectedEditor != PageView.UML) ? 'block' : 'none'} !important;
`;

export default class TextEditor extends React.Component {

	componentDidMount() {
		this.props.initEditorCtrl();
	}

	render() {
		return (
			<StyledContainer>
				<StyledTextEditor
					id="textEditor"
					selectedEditor={this.props.selectedEditor}
					showCodingView={this.props.showCodingView}
				/>
			</StyledContainer>
		);
	}
}
