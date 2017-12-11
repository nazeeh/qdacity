import React from 'react';
import styled from 'styled-components';

import {
	DragSource
} from 'react-dnd';

const StyledDocumentItem = styled.a `
	background-color: ${props => props.active ? props.theme.bgPrimaryHighlight : ''} !important;
	color: ${props => props.active ? props.theme.fgPrimaryHighlight : ''};
	padding: 2px 2px !important;
	position: relative;
	display: block;
	padding: 10px 15px;
	margin-bottom: -1px;
	background-color: #fff;
	border: 1px solid ;
	border-color: ${props => props.theme.borderPrimary} !important;
	&:hover {
		text-decoration: none;
		cursor: pointer;
		background-color: ${props => props.theme.borderPrimary};
		color: ${props => props.theme.fgPrimaryHighlight};
	}
`;

const documentSource = {
	beginDrag(props, monitor, component) {
		return {
			documentId: props.doc.id
		};
	},
	endDrag(props, monitor, component) {
		const dropResult = monitor.getDropResult();

		if (dropResult) {
			alert('DROP!');
		}
	}
};

function collectSource(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging(),
	};
}

class Document extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const _this = this;

		const {
			connectDragSource
		} = this.props;

		return connectDragSource(
			<div>
		        <StyledDocumentItem 
                active={this.props.active} 
                key={this.props.doc.id}  
                >{this.props.doc.title}</StyledDocumentItem>
            </div>);
	}
}

const DragDocument = DragSource("document", documentSource, collectSource)(Document)

export {
	DragDocument
};