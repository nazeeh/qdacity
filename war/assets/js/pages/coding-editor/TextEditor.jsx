import React from 'react'
import styled from 'styled-components';

import {
	PageView
} from './View/PageView.js';


const StyledContainer = styled.div `
	position: relative;
`;

const StyledCollaboratorBox = styled.div `
	position: absolute;
	left: 0;
	bottom: 0;
`;

const StyledCollaborator = styled.div `
	display: flex;
	justify-content: center;
	flex-direction: column;
	width: 50px;
	height: 50px;
	background: url(${props => props.picSrc}) no-repeat;
	background-size: cover;
	border-radius: 50%;
	margin: 10px;
	box-shadow: 1px 1px 4px rgba(0,0,0,0.5);

	&:after {
		display: none;
		content: "${props => props.name}";
		position: absolute;
		left: 70px;
		background: #fefefe;
		box-shadow: 1px 1px 4px rgba(0,0,0,.5);
		border-radius: 5px;
		padding: .2em .5em;
		white-space: pre;
	}

	&:hover:after {
		display: initial;
	}
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
	constructor(props) {
		super(props);
		this.state = {
			collaborators: [],
		};

		this.updateCollaborators = this.updateCollaborators.bind(this);
	}

	componentDidMount() {
		this.props.initEditorCtrl();
	}

	updateCollaborators(list) {
		this.setState({ collaborators: list });
	}

	render() {
		return (
			<StyledContainer>
				<StyledCollaboratorBox>
					{this.state.collaborators.map(c => (
						<StyledCollaborator
							picSrc={c.picSrc}
							name={c.name} />
					))}
				</StyledCollaboratorBox>
				<StyledTextEditor
					id="textEditor"
					selectedEditor={this.props.selectedEditor}
					showCodingView={this.props.showCodingView}
				/>
			</StyledContainer>
		);
	}
}
