import React from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import {
	DragSource
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {
	DropTarget
} from 'react-dnd';

import SimpleCode from './SimpleCode.jsx';

const codeSource = {
	beginDrag(props, monitor, component) {
		return {
			codeId: props.node.codeID
		};
	},
	endDrag(props, monitor, component) {
		const dropResults = monitor.getDropResult();
		if (dropResults) props.relocateCode(props.node, monitor.getDropResult().targetID);
	}
};

const codeTarget = {

	drop(props, monitor, component) {
		const hasDroppedOnChild = monitor.didDrop();
		if (!hasDroppedOnChild) {
			return {
				targetID: props.node.codeID
			};
		}
	}
};

function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging(),
	};
}

function collectTarget(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop()
	};
}

const StyledCodingBubble = styled.span `
	background-color: rgb(231, 231, 231);
	border: 1px solid rgb(187, 187, 187);
	text-align: center;
	border-radius: 10px;
	color: rgb(102, 102, 102);
	width: 35px;
	cursor: pointer;
	margin-left: auto;
	margin-top: 1px;
	margin-bottom: 1px;
	margin-right: 3px;
`;

class Code extends SimpleCode {
	constructor(props) {
		super(props);
		this.renderCodingCount = this.renderCodingCount.bind(this);

	}

	// overriding super method
	renderCodingCount() {
		return (
			<StyledCodingBubble	onClick={this.props.showFooter}>
					{this.props.node.codingCount}
			</StyledCodingBubble>
		);
	}

	renderChild(childCode, level, index) {
		return (
			<DragAndDropCode
					showSimpleView={this.props.showSimpleView}
					documentsView={this.props.documentsView}
					level={level + 1}
					node={childCode}
					selected={this.props.selected}
					setSelected={this.props.setSelected}
					relocateCode={this.props.relocateCode}
					showFooter={this.props.showFooter}
					key={"CS" + "_" + level+ "_" +index}
		            pageView={this.props.pageView}
		            umlEditor={this.props.umlEditor}
				>
				</DragAndDropCode>
		);
	}

	render() {
		const {
			connectDragSource,
			isDragging,
			connectDropTarget
		} = this.props;
		var _this = this;
		return connectDropTarget(this.props.connectDragSource(
			<div>
			            {this.renderNodesRecursive(this.props.node, this.props.level)}
			    </div>
		));
	}
}

const DragSourceCode = DragSource("code", codeSource, collect)(Code)
const DragAndDropCode = DropTarget("code", codeTarget, collectTarget)(DragSourceCode)
export {
	DragAndDropCode,
	Code
};