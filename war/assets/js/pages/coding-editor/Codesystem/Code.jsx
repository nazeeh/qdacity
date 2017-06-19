import React from 'react';

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

class Code extends SimpleCode {
	constructor(props) {
		super(props);
		this.renderCodingCount = this.renderCodingCount.bind(this);

	}

	getStyles() {
		return {
			noCaretPadding: {
				paddingLeft: "18px"
			},
			caretSelected: {
				color: "#fff"
			},
			node: {
				fontFamily: "tahoma, arial, helvetica",
				fontSize: "10pt",
				marginLeft: (this.props.level * 15) + 'px',
				display: "flex",
				alignItems: "center"
			},
			nodeSelected: {
				color: "#fff",
				backgroundColor: "#337ab7"
			},
			codeIcon: {
				padding: "3px 4px 3px 0px"
			},
			codingBubble: {
				backgroundColor: "rgb(231, 231, 231)",
				border: "1px solid rgb(187, 187, 187)",
				textAlign: "center",
				borderRadius: "10px",
				color: "rgb(102, 102, 102)",
				width: "35px",
				cursor: "pointer",
				marginLeft: "auto",
				marginTop: "1px",
				marginBottom: "1px",
				marginRight: "3px"
			}
		}
	}


	// overriding super method
	renderCodingCount() {
		const style = this.getStyles().codingBubble;
		return (
			<span 
					className="" 
					style={style}
					onClick={this.props.showFooter}
				>
					{this.props.node.codingCount}
				</span>
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
		const styles = this.getStyles();
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