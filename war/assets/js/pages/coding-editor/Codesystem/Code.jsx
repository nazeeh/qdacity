import React from 'react';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext(HTML5Backend)
export default class Code extends React.Component {
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
				expander: {
					paddingLeft: "18px"
				}
			}
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

		renderIcon(node) {
			if (this.props.node.children.length == 0) {
				return <a className="node-link" style={this.getStyles().expander} ></a>
			}
			
		    var direction = this.props.node.collapsed ?  'right' : 'down';
			
		    var className = 'fa fa-caret-' + direction + ' fa-fw';
			
		    return <a className="node-link" onClick={() => this.nodeIconClick(node)}>
						<i className={className} />
					</a>;
		}
		
		renderNode(){
			return <div className="node" style={{ marginLeft: (this.props.level * 15) + 'px' }}>
			            {this.renderIcon(this.props.node)}
			            {this.props.node.name}
			    </div>
		}
		
		renderNodesRecursive(code, level, parentkey) {
				const _this = this;
				let count = 0;
				const lst = [];
				var node = this.props.node;
				const key = (parentkey ? parentkey + '_' : '') + count;
				const thisNode = _this.renderNode(code, level, key);
				var children = "";
				lst.push(thisNode);
				if (!node.collapsed && !node.leaf && node.children) {
					children = node.children.map((childCode, index) => {
						return (
							<Code level={level + 1} node={childCode} key={key + "_" +index}></Code>
						);
					});
				}
		

				// the children divkey
				const divkey = (parentkey ? parentkey : '') + 'ch';

				return (
					<div key={divkey + 'trans'} 
				     >
	    				{lst}
	    				{children}
					</div>
				);
		};
		
		render() {
			const styles = this.getStyles();
			var _this = this;
			return (
				<div>
			            {this.renderNodesRecursive(this.props.node, this.props.level, this.props.key)}
			    </div>
			);
		}
}