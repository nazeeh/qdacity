import React from 'react';

export default class SimpleCode extends React.Component {
		constructor(props) {
			super(props);
			this.codesystem = {};
			this.state = {
				node: this.props.node,
				level: this.props.level
			};
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
				codeIcon:{
					padding: "3px 4px 3px 0px"
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
		
		
		/* 
		** SimpleCode does not show a coding count
		** Can be overridden to add an optional UI for the coding count
		*/
		renderCodingCount(){
			return "";
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
		
		renderChild(childCode,level,index){
			return (
				<SimpleCode 
					documentsView={this.props.documentsView}
					level={level + 1}
					node={childCode} 
					selected={this.props.selected} 
					setSelected={this.props.setSelected} 
					relocateCode={this.props.relocateCode}
					showFooter={this.props.showFooter}  
					key={"CS" + "_" + level+ "_" +index}
				>
				</SimpleCode>
			);
		}
		
		renderNodesRecursive(code, level) {
				const _this = this;
				let count = 0;
				var node = this.props.node;
				const thisNode = _this.renderNode(level);
				var children = "";
				if (!node.collapsed && !node.leaf && node.children) {
					children = node.children.map((childCode, index) => {
						return _this.renderChild(childCode,level,index);
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
			return (
				<div>
			           {this.renderNodesRecursive(this.props.node, this.props.level)}
			    </div>
		    );

		}
}

