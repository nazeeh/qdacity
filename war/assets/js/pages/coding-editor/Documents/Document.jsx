import React from 'react';
import styled from 'styled-components';

import { DragSource, DropTarget } from 'react-dnd';

import { findDOMNode } from 'react-dom';

import { getEmptyImage } from 'react-dnd-html5-backend';

import CollaboratorBubbles from '../../../common/SyncService/CollaboratorBubbles';

const StyledDocumentItem = styled.a`
	background-color: ${props =>
		props.active ? props.theme.bgPrimaryHighlight : '#fff'};
	color: ${props => (props.active ? props.theme.fgPrimaryHighlight : '')};
	padding: 2px 2px;
	position: relative;
	display: flex;
	margin-bottom: -1px;
	border: 1px solid ${props => props.theme.borderPrimary};
	opacity: ${props => (props.isDragging ? 0.0 : 1)};
	&:hover {
		text-decoration: none;
		cursor: pointer;
		background-color: ${props =>
		props.isDragging
			? props.theme.bgPrimary
			: props.theme.bgPrimaryHighlight};
		color: ${props =>
		props.isDragging
			? props.theme.fgPrimary
			: props.theme.fgPrimaryHighlight};
	}
`;

const StyledDocumentItemTitle = styled.div`
	flex: 1 1 auto;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const documentSource = {
	beginDrag(props, monitor, component) {
		return {
			index: props.index, // Required for sorting
			baseIndex: props.index // Required for remembering the original index
		};
	},
	endDrag(props, monitor, component) {
		const dropResult = monitor.getDropResult();

		if (dropResult) {
			const dragIndex = monitor.getItem().baseIndex;
			const dropIndex = props.index;

			props.persistSwappedDocuments(dragIndex, dropIndex);
		}
	}
};

const documentTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		if (dragIndex === hoverIndex) {
			return;
		}

		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		const clientOffset = monitor.getClientOffset();

		const hoverClientY = clientOffset.y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return;
		}

		props.swapDocuments(dragIndex, hoverIndex);

		monitor.getItem().index = hoverIndex;
	}
};

function collectSource(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging()
	};
}

function collectTarget(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop()
	};
}

class Document extends React.Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		this.props.setActiveDocument(this.props.doc.id);
	}

	render() {
		const _this = this;

		const { isDragging, connectDragSource, connectDropTarget } = this.props;

		return connectDragSource(
			connectDropTarget(
				<div>
					<StyledDocumentItem
						isDragging={isDragging}
						active={this.props.active}
						onClick={this.onClick}
					>
						<StyledDocumentItemTitle>
							{this.props.doc.title}
						</StyledDocumentItemTitle>
						<CollaboratorBubbles
							syncService={this.props.syncService}
							docid={this.props.doc.id}
						/>
					</StyledDocumentItem>
				</div>
			)
		);
	}
}

const DropDocument = DropTarget('document', documentTarget, collectTarget)(
	Document
);
const DragDocument = DragSource('document', documentSource, collectSource)(
	DropDocument
);

export { DragDocument };
