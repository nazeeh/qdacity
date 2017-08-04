import React from 'react'
import styled from 'styled-components';

import {
	PageView
} from './View/PageView.js';


const StyledTextEditor = styled.iframe `
	height: ${props => props.showCodingView ? 'calc(100vh - 350px)' : 'calc(100vh - 51px)'} !important;
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
`;

export default class TextEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	componentDidMount() {
		this.props.initEditorCtrl();
	}

	render(){
		return(
			<StyledTextEditor id = "textEditor"  selectedEditor={this.props.selectedEditor} showCodingView={this.props.showCodingView}>
			</StyledTextEditor>
		);
	}
}