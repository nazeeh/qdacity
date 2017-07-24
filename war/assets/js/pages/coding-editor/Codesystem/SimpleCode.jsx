import React from 'react';
import styled from 'styled-components';

import MetaModelMapper from '../../uml-editor/mapping/MetaModelMapper.js';

import {
	PageView
} from '../View/PageView.js';

const StyledCode = styled.div `
    font-family: tahoma, arial, helvetica;
    font-size: 10pt;
    font-weight: ${props => props.highlightNode ? 'bold' : 'normal'};
    margin-left:${props => (props.level * 15) + 'px' };
    display: flex;
    align-items: center;
    color: ${props => props.selected ? (props.highlightNode ? '#ffaa00' : '#fff') : (props.highlightNode ? '#ffaa00' : '#000')};
    background-color: ${props => props.selected ? '#337ab7' : ''};
    &:hover {
        background: #63a0d4;
    }
`;

const StyledExpander = styled.a `
    padding-left:${props => props.hasChildren ? '' : '18px'};
    color: ${props => props.selected ? '#fff' : '#000'};
`;

const StyledCodeIcon = styled.i `
    color: ${props => props.color};
    padding-right: 4px;
`;

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

	nodeIconClick(node) {
		if (node.collapsed) {
			this.expandNode(node);
		} else {
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

	hasChildren() {
		return this.props.node.children.length != 0;
	}

	renderExpander(node) {
		var caret = ""
		if (this.hasChildren()) {
			var direction = this.props.node.collapsed ? 'right' : 'down';
			var className = 'fa fa-caret-' + direction + ' fa-fw';
			caret = <i className={className} />
		}

		return <StyledExpander hasChildren={this.hasChildren()} selected = {this.props.node == this.props.selected}  className="node-link" onClick={() => this.nodeIconClick(node)}>
                        {caret}
                    </StyledExpander>;
	}

	/*
	 ** SimpleCode does not show a coding count
	 ** Can be overridden to add an optional UI for the coding count
	 */
	renderCodingCount() {
		return "";
	}



	renderNode(level) {
		const highlightNode = this.props.pageView == PageView.UML && this.props.umlEditor.getMetaModelMapper().isCodeValidNode(this.props.node);

		return <div className=""> 
                <StyledCode
                        selected = {this.props.node == this.props.selected}
                        level={level}
                        className="clickable"
                        key={"CS" + "_" + level}
                        highlightNode={highlightNode}
                        onClick={() => this.props.setSelected(this.props.node)}
                    >
                            {this.renderExpander(this.props.node)}
                            <StyledCodeIcon className="fa fa-tag fa-lg" color={this.props.node.color}/>
                            {this.props.node.name}
                            {this.renderCodingCount()}
                </StyledCode>
                </div>
	}

	renderChild(childCode, level, index) {
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
		            pageView={this.props.pageView}
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
				return _this.renderChild(childCode, level, index);
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