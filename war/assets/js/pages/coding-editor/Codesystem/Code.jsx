import React from 'react';

import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';

const codeSource = {
  beginDrag() {
    return {};
  },
};

const codeTarget = {

  drop(props, monitor, component) {
  	const hasDroppedOnChild = monitor.didDrop();
    if (!hasDroppedOnChild) window.alert("dropped in code "+ props.node.name);
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

class Code extends React.Component {
		constructor(props) {
			super(props);
			this.codesystem = {};
			this.state = {
				node: this.props.node,
				level: this.props.level
			};
			
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
					marginLeft: (this.props.level * 15) + 'px' 
				}, 
				nodeSelected: {
					color: "#fff",
					backgroundColor: "#337ab7"
				}
			}
		}
		
		styleNode(){
			var styles = this.getStyles();
			var nodeStyles = styles.node;
			if (this.props.node == this.props.selected) Object.assign(nodeStyles, styles.nodeSelected);
			return nodeStyles;
		}
		
		styleExpander(){
			var styles = this.getStyles();
			var caretStyles = {};
			if (!this.hasChildren()) Object.assign(caretStyles, styles.noCaretPadding);
			if (this.props.node == this.props.selected) Object.assign(caretStyles, styles.caretSelected);
			return caretStyles;
		}
		
		nodeIconClick(node) {
			if (node.collapsed) {
				this.expandNode(node);
			}
			else {
				this.collapseNode(node);
			}
		}
		
		expandNode(node) {
			node.collapsed = false;
			this.forceUpdate();
		}

		collapseNode(node) {
			node.collapsed = true;
			this.forceUpdate();
		}
		
		hasChildren(){
			return this.props.node.children.length != 0;
		}

		renderIcon(node) {
			var caret = ""
			if (this.hasChildren()) {
				var direction = this.props.node.collapsed ?  'right' : 'down';
				var className = 'fa fa-caret-' + direction + ' fa-fw';
				caret = <i className={className} />
			}
			
		    return <a className="node-link" onClick={() => this.nodeIconClick(node)} style={this.styleExpander()}>
						{caret}
					</a>;
		}
		
		
		
		renderNode(level){
			return <div 
					className="clickable node" 
					style={this.styleNode()}
					key={"CS" + "_" + level}
					onClick={() => this.props.setSelected(this.props.node)}
				>
			            {this.renderIcon(this.props.node)}
			            {this.props.node.name}
			    </div>
		}
		
		renderNodesRecursive(code, level) {
				const _this = this;
				let count = 0;
				const lst = [];
				var node = this.props.node;
				const thisNode = _this.renderNode(level);
				var children = "";
				lst.push(thisNode);
				if (!node.collapsed && !node.leaf && node.children) {
					children = node.children.map((childCode, index) => {
						return (
							<DragAndDropCode level={level + 1} node={childCode} selected={this.props.selected} setSelected={this.props.setSelected} connectDragSource={this.props.connectDragSource} key={"CS" + "_" + level+ "_" +index}></DragAndDropCode>
						);
					});
				}
		

				return (
					<div key={"CS" + "_" + level} 
				     >
	    				{lst}
	    				{children}
					</div>
				);
		};
		
		render() {
			const { connectDragSource, isDragging, connectDropTarget } = this.props;
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
export default DragAndDropCode
