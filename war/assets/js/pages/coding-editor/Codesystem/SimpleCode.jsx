import React from 'react';
import styled from 'styled-components';

import MetaModelMapper from '../../uml-editor/mapping/MetaModelMapper.js';

export const StyledCode = styled.div `
    font-family: tahoma, arial, helvetica;
    font-size: 10pt;
    font-weight: 'normal';
    margin-left:${props => (props.level * 15) + 'px' };
    display: flex;
    align-items: center;
    color: ${props => props.selected ? '#fff' : '#000'};
    background-color: ${props => props.selected ? '#337ab7' : ''};
    &:hover {
        background: #63a0d4;
    }
`;

export const StyledExpander = styled.a `
    padding-left:${props => props.hasChildren ? '' : '18px'};
    color: ${props => props.selected ? '#fff' : '#000'};
`;

export const StyledCodeIcon = styled.i `
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

	renderExpander(node, highlightNode) {
		var caret = ""
		if (this.hasChildren()) {
			var direction = this.props.node.collapsed ? 'right' : 'down';
			var caretClassName = 'fa fa-caret-' + direction + ' fa-fw';
			caret = <i className={caretClassName} />
		}

		const hasChildren = this.hasChildren();
		const selected = this.props.node == this.props.selected;
		const className = "node-link";
		const onClick = () => this.nodeIconClick(node);

		return this.renderSimpleExpander(hasChildren, selected, className, onClick, highlightNode, caret);
	}

	renderSimpleExpander(hasChildren, selected, className, onClick, highlightNode, caret) {
		return (
			<StyledExpander 
                    hasChildren={hasChildren} 
                    selected={selected} 
                    className={className}
                    onClick={onClick}
		            highlightNode={highlightNode}>
                    {caret}
                </StyledExpander>
		);
	}

	/*
	 ** SimpleCode does not show a coding count
	 ** Can be overridden to add an optional UI for the coding count
	 */
	renderCodingCount() {
		return "";
	}

	shouldHighlightNode(code) {
		if (this.props.shouldHighlightNode == null) {
			return false;
		}

		return this.props.shouldHighlightNode(code);
	}

	renderNode(level) {
		const selected = this.props.node == this.props.selected;
		const className = "clickable";
		const key = "CS" + "_" + level;
		const highlightNode = this.shouldHighlightNode(this.props.node);
		const onClick = () => this.props.setSelected(this.props.node);

		return (
			<div className="">
		            {this.renderStyledNode(selected, level, className, key, highlightNode, onClick)}
            </div>
		);
	}

	renderStyledNode(selected, level, className, key, highlightNode, onClick) {
		return (
			<StyledCode
                        selected={selected}
                        highlightNode={highlightNode}
                        level={level}
                        className={className}
                        key={key}
		                onClick={onClick}
                    >
                    {this.renderExpander(this.props.node, highlightNode)}
                    {this.renderNodeIcon()}
                    {this.renderNodeName()}
                    {this.renderCodingCount()}
                </StyledCode>
		);
	}

	renderNodeIcon() {
		return (
			<StyledCodeIcon className="fa fa-tag fa-lg" color={this.props.node.color}/>
		);
	}

	renderNodeName() {
		return (this.props.node.name);
	}

	renderChild(childCode, level, index) {
		const newLevel = level + 1;
		const key = "CS" + "_" + level + "_" + index;

		return this.renderChildSimple(childCode, newLevel, key);
	}

	renderChildSimple(childCode, level, key) {
		return (
			<SimpleCode
                    documentsView={this.props.documentsView}
                    level={level}
                    node={childCode}
                    selected={this.props.selected}
                    setSelected={this.props.setSelected}
                    relocateCode={this.props.relocateCode}
                    showFooter={this.props.showFooter}
                    key={key}
		            shouldHighlightNode={this.props.shouldHighlightNode}
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