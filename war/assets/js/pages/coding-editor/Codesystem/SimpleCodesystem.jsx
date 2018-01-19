import React from 'react';
import styled from 'styled-components';

import { Code } from './Code.jsx';
import SimpleCode from './SimpleCode.jsx';

const StyledSimpleCodesystem = styled.div`
	height: ${props => props.height} !important;
	max-height: ${props => props.maxHeight} !important;
	overflow: auto;
`;

export default class SimpleCodesystem extends React.Component {
	constructor(props) {
		super(props);
		this.codesystem = {};
		this.state = {
			selected: this.props.selected ? this.props.selected : {},
			codesystem: [],
			height: this.props.height,
			maxHeight: this.props.maxHeight
		};

		this.state.codesystem = this.props.codesystem;

		this.setSelected = this.setSelected.bind(this);
		this.getCodesystem = this.getCodesystem.bind(this);

		this.expandParents(this.state.selected);
	}

	notifyOnSelection(code) {
		if (this.props.notifyOnSelected != null) {
			this.props.notifyOnSelected(code);
		}
	}

	setHeight(height) {
		this.setState({
			height: height
		});
	}

	setMaxHeight(maxHeight) {
		this.setState({
			maxHeight: maxHeight
		});
	}

	sortCodes(codeSiblings) {
		var _this = this;
		codeSiblings.sort((a, b) => {
			return a.name > b.name;
		});

		codeSiblings.forEach(code => {
			if (code.children) {
				_this.sortCodes(code.children);
			}
		});
	}

	setSelected(code) {
		this.notifyOnSelection(code);

		this.expandParents(code);

		// Set selection
		this.setState({
			selected: code
		});
	}

	expandParents(code) {
		// Expand all parents
		let parentID = code.parentID;

		while (parentID != null) {
			const parent = this.getCodeByCodeID(parentID);

			parent.collapsed = false;

			parentID = parent.parentID;
		}
	}

	getSelected() {
		return this.state.selected;
	}

	getCodesystem() {
		return this.state.codesystem;
	}

	getAllCodes() {
		return this.getAllCodesRecursive(this.state.codesystem);
	}

	getAllCodesRecursive(codeSiblings) {
		let codes = [];
		for (var i in codeSiblings) {
			let code = codeSiblings[i];
			codes.push(code);
			let childCodes = this.getAllCodesRecursive(code.children);
			codes = codes.concat(childCodes);
		}

		return codes;
	}

	getCodeById(id) {
		const find = (codeArr, id) => {
			for (var i in codeArr) {
				var code = codeArr[i];

				if (code.id == id) {
					return code;
				}

				let found = find(code.children, id);
				if (found) {
					return found;
				}
			}

			return null;
		};

		return find(this.state.codesystem, id);
	}

	getCodeByCodeID(codeID) {
		return this.getCodeByCodeIDAndCodes(this.state.codesystem, codeID);
	}

	getCodeByCodeIDAndCodes(codeArr, codeID) {
		var _this = this;
		var found;
		for (var i in codeArr) {
			var code = codeArr[i];
			if (code.codeID == codeID) {
				return code;
			}
			found = _this.getCodeByCodeIDAndCodes(code.children, codeID);
			if (found) return found;
		}
	}

	renderRoots(codes) {
		return codes.map((code, index) => {
			const level = 0;
			const key = 'CS' + '_' + 0 + '_' + index;

			return this.renderRoot(code, level, key);
		});
	}

	renderRoot(code, level, key) {
		return (
			<SimpleCode
				level={level}
				node={code}
				selected={this.state.selected}
				setSelected={this.setSelected}
				key={key}
				isCodeSelectable={this.props.isCodeSelectable}
				getFontWeight={this.props.getFontWeight}
				getTextColor={this.props.getTextColor}
				getBackgroundColor={this.props.getBackgroundColor}
				getBackgroundHoverColor={this.props.getBackgroundHoverColor}
			/>
		);
	}

	renderNodes(codeSiblings, level) {
		return <div>{this.renderRoots(codeSiblings)}</div>;
	}

	renderCodesystem() {
		return this.renderNodes(this.state.codesystem);
	}

	render() {
		let height = null;
		let maxHeight = null;

		if (this.state.height != null) {
			height = this.state.height + 'px';
		} else {
			height = 'auto';
		}

		if (this.state.maxHeight != null) {
			maxHeight = this.state.maxHeight + 'px';
		} else {
			maxHeight = 'auto';
		}

		return (
			<StyledSimpleCodesystem
				height={height}
				maxHeight={maxHeight}
				className="codesystemView"
			>
				{this.renderCodesystem()}
			</StyledSimpleCodesystem>
		);
	}
}
