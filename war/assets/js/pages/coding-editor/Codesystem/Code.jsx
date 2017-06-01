import React from 'react';

import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';

const codeSource = {
  beginDrag(props, monitor, component) {
    return {codeId: props.node.codeID};
  },
  endDrag(props, monitor, component){
  	props.relocateCode(props.node, monitor.getDropResult().targetID);
  }
};

const codeTarget = {

  drop(props, monitor, component) {
  	const hasDroppedOnChild = monitor.didDrop();
    if (!hasDroppedOnChild){
     	return {targetID: props.node.codeID};
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

class Code extends React.Component {
		constructor(props) {
			super(props);
			this.codesystem = {};
			this.state = {
				node: this.props.node,
				codingCount: 0,
				level: this.props.level
			};
			this.renderCodingCount = this.renderCodingCount.bind(this);
			
			if (!this.props.showSimpleView) this.calculateCodingCount();
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
				codeIcon:{
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
		
		calculateCodingCount(){
			var codingCount = 0;
			var documents = this.props.documentsView.getDocuments();
			for (var index in documents) {
				var doc = documents[index];
				var elements = doc.text;
				var foundArray = $('coding[code_id=\'' + this.state.node.codeID + '\']', elements).map(function () {
					return $(this).attr('id');
				});
				var idsCounted = []; // When a coding spans multiple HTML blocks,
				// then there will be multiple elements with
				// the same ID
				for (var j = 0; j < foundArray.length; j++) {
					if ($.inArray(foundArray[j], idsCounted) != -1)
						continue;
					codingCount++;
					idsCounted.push(foundArray[j]);
				}
			}
			this.state.node.codingCount = codingCount;
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

		renderExpander(node) {
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
		
		renderIcon(node){
			const iconStyle = this.getStyles().codeIcon;
			iconStyle.color = node.color;
			return <i className="fa fa-tag fa-lg" style={iconStyle}></i>
		}
		
		renderCodingCount(){
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
		
		renderNode(level){
			return <div className=""> 
			<div 
					className="clickable" 
					style={this.styleNode()}
					key={"CS" + "_" + level}
					onClick={() => this.props.setSelected(this.props.node)}
				>
			            {this.renderExpander(this.props.node)}
			            {this.renderIcon(this.props.node)}
			            {this.props.node.name}
			            {this.renderCodingCount()}
			    </div>
			    </div>
		}
		
		renderNodesRecursive(code, level) {
				const _this = this;
				let count = 0;
				var node = this.props.node;
				const thisNode = _this.renderNode(level);
				var children = "";
				if (!node.collapsed && !node.leaf && node.children) {
					children = node.children.map((childCode, index) => {
						if (this.props.showSimpleView){
							return (
								<Code 
									showSimpleView={this.props.showSimpleView}
									documentsView={this.props.documentsView}
									level={level + 1}
									node={childCode} 
									selected={this.props.selected} 
									setSelected={this.props.setSelected} 
									relocateCode={this.props.relocateCode}
									show	Footer={this.props.showFooter}  
									key={"CS" + "_" + level+ "_" +index}
								>
								</Code>
							);
						}
						else {
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
						
					});
				}	

				return (
					<div key={"CS" + "_" + level} 
				     >
	    				{thisNode}
	    				{children}
					</div>
				);
		};
		
		render() {
			const { connectDragSource, isDragging, connectDropTarget } = this.props;
			const styles = this.getStyles();
			var _this = this;
			if (this.props.showSimpleView) {
				return (<div>
			            {this.renderNodesRecursive(this.props.node, this.props.level)}
			    </div>);
			}
			
			this.calculateCodingCount();
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

