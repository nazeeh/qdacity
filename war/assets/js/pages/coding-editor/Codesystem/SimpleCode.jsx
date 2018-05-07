import React from 'react';
import styled from 'styled-components';

import Theme from '../../../common/styles/Theme.js';

export const StyledCode = styled.div`
	font-family: tahoma, arial, helvetica;
	font-size: 10pt;
	font-weight: ${props => props.fontWeight};
	margin-left: ${props => props.level * 15 + 'px'};
	display: flex;
	align-items: center;
	cursor: ${props =>
		props.isCodeSelectable ? 'default' : 'not-allowed !important'};
	color: ${props => props.textColor};
	background-color: ${props => props.backgroundColor};

	&:hover {
		background: ${props => props.backgroundHoverColor};
	}
`;

export const StyledExpander = styled.a`
	padding-left: ${props => (props.hasChildren ? '' : '18px')};
	color: ${props => props.color};
`;

export const StyledCodeIcon = styled.i`
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

	renderExpander(node, textColor) {
		var caret = '';
		if (this.hasChildren()) {
			var direction = this.props.node.collapsed ? 'right' : 'down';
			var caretClassName = 'fa fa-caret-' + direction + ' fa-fw';
			caret = <i className={caretClassName} />;
		}

		const hasChildren = this.hasChildren();
		const selected = this.props.node == this.props.selected;
		const className = 'node-link';
		const onClick = () => this.nodeIconClick(node);

		return (
			<StyledExpander
				hasChildren={hasChildren}
				selected={selected}
				className={className}
				onClick={onClick}
				color={textColor}
			>
				{caret}
			</StyledExpander>
		);
	}

	/*
	 ** SimpleCode does not show a coding count
	 ** Can be overridden to add an optional UI for the coding count
	 */
	renderCodingCount() {
		return '';
	}

	getFontWeight(code, selected) {
		let weight = null;

		weight = this.doGetFontWeight(code, selected);

		if (weight == null) {
			return 'normal';
		}

		return weight;
	}

	doGetFontWeight(code, selected) {
		if (this.props.getFontWeight != null) {
			return this.props.getFontWeight(code, selected);
		}
		return null;
	}

	getTextColor(code, selected) {
		let color = null;

		color = this.doGetTextColor(code, selected);

		if (color == null) {
			if (
				this.props.isCodeSelectable != null &&
				!this.props.isCodeSelectable(code)
			) {
				color = '#707070';
			} else {
				if (selected) {
					color = '#fff';
				} else {
					color = '#000';
				}
			}
		}

		return color;
	}

	doGetTextColor(code, selected) {
		if (this.props.getTextColor != null) {
			return this.props.getTextColor(code, selected);
		}
		return null;
	}

	getBackgroundColor(code, selected) {
		let color = null;

		color = this.doGetBackgroundColor(code, selected);

		if (color == null) {
			if (selected) {
				return Theme.bgPrimaryHighlight;
			} else {
				return '';
			}
		}

		return color;
	}

	doGetBackgroundColor(code, selected) {
		if (this.props.getBackgroundColor != null) {
			return this.props.getBackgroundColor(code, selected);
		}
		return null;
	}

	getBackgroundHoverColor(code, selected) {
		let color = null;

		color = this.doGetBackgroundHoverColor(code, selected);

		if (color == null) {
			if (
				this.props.isCodeSelectable != null &&
				!this.props.isCodeSelectable(code)
			) {
				color = '#e0e0e0';
			} else {
				color = Theme.bgHover;
			}
		}

		return color;
	}

	doGetBackgroundHoverColor(code, selected) {
		if (this.props.getBackgroundHoverColor != null) {
			return this.props.getBackgroundHoverColor(code, selected);
		}
		return null;
	}

	renderNode(level) {
		const selected = this.props.node == this.props.selected;
		const className = 'clickable';
		const key = 'CS' + '_' + level;
		const fontWeight = this.getFontWeight(this.props.node, selected);
		const textColor = this.getTextColor(this.props.node, selected);
		const backgroundColor = this.getBackgroundColor(this.props.node, selected);
		const backgroundHoverColor = this.getBackgroundHoverColor(
			this.props.node,
			selected
		);
		const isCodeSelectable =
			this.props.isCodeSelectable != null
				? this.props.isCodeSelectable(this.props.node)
				: true;
		const onClick = () => {
			if (isCodeSelectable) {
				this.props.setSelected(this.props.node);
			}
		};

		return (
			<div className="">
				{this.renderStyledNode(
					selected,
					level,
					className,
					key,
					onClick,
					isCodeSelectable,
					fontWeight,
					textColor,
					backgroundColor,
					backgroundHoverColor
				)}
			</div>
		);
	}

	renderStyledNode(
		selected,
		level,
		className,
		key,
		onClick,
		isCodeSelectable,
		fontWeight,
		textColor,
		backgroundColor,
		backgroundHoverColor
	) {
		if (!this.props.doesCodeMatchSearchText(this.props.node)) {
			return null;
		}

		return (
			<StyledCode
				selected={selected}
				isCodeSelectable={isCodeSelectable}
				fontWeight={fontWeight}
				textColor={textColor}
				backgroundColor={backgroundColor}
				backgroundHoverColor={backgroundHoverColor}
				level={level}
				className={className}
				key={key}
				onClick={onClick}
			>
				{this.renderExpander(this.props.node, textColor)}
				{this.renderNodeIcon()}
				{this.renderNodeName()}
				{this.renderCodingCount()}
			</StyledCode>
		);
	}

	renderNodeIcon() {
		return (
			<StyledCodeIcon
				className="fa fa-tag fa-lg"
				color={this.props.node.color}
			/>
		);
	}

	renderNodeName() {
		return this.props.node.name;
	}

	renderChild(childCode, level, index) {
		const newLevel = level + 1;
		const key = 'CS' + '_' + level + '_' + index;

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
				isCodeSelectable={this.props.isCodeSelectable}
				getFontWeight={this.props.getFontWeight}
				getTextColor={this.props.getTextColor}
				getBackgroundColor={this.props.getBackgroundColor}
				getBackgroundHoverColor={this.props.getBackgroundHoverColor}
			/>
		);
	}

	renderNodesRecursive(code, level) {
		const _this = this;
		let count = 0;
		var node = this.props.node;
		const thisNode = _this.renderNode(level);
		var children = '';
		if (!node.collapsed && !node.leaf && node.children) {
			children = node.children.map((childCode, index) => {
				return _this.renderChild(childCode, level, index);
			});
		}

		return (
			<div key={'CS' + '_' + level}>
				{thisNode}
				{children}
			</div>
		);
	}

	render() {
		return (
			<div>{this.renderNodesRecursive(this.props.node, this.props.level)}</div>
		);
	}
}
