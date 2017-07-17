import React from 'react';
import {
	Code
} from './Code.jsx';
import SimpleCode from './SimpleCode.jsx';

export default class SimpleCodesystem extends React.Component {
	constructor(props) {
		super(props);
		this.codesystem = {};
		this.state = {
			pageView: null,
			slected: {},
			codesystem: []
		};

		this.umlEditor = null;

		this.state.codesystem = this.props.codesystem;

		this.setSelected = this.setSelected.bind(this);
		this.getCodesystem = this.getCodesystem.bind(this);
	}

	// Can be overwritten to notify other components on a new selection
	notifyOnSelection(code) {}

	sortCodes(codeSiblings) {
		var _this = this;
		codeSiblings.sort((a, b) => {
			return a.name > b.name;
		});

		codeSiblings.forEach((code) => {
			if (code.children) {
				_this.sortCodes(code.children);
			}
		})
	}

	pageViewChanged(view) {
		this.setState({
			pageView: view
		});
	}

	setUmlEditor(umlEditor) {
		this.umlEditor = umlEditor;
	}

	setSelected(code) {
		this.notifyOnSelection(code);
		this.setState({
			selected: code
		});
	}

	getSelected() {
		return this.state.selected;
	}

	getCodesystem() {
		return this.state.codesystem;
	}

	getCodeByCodeID(codeID) {
		return this.getCodeByID(this.state.codesystem, codeID);
	}

	getCodeByID(codeArr, codeID) {
		var _this = this;
		var found;
		for (var i in codeArr) {
			var code = codeArr[i];
			if (code.codeID == codeID) {
				return code;
			}
			found = _this.getCodeByID(code.children, codeID);
			if (found) return found;
		}
	}

	renderRoots(codes) {
		return codes.map((code, index) => {
			return (
				<SimpleCode
							level={0} 
							node={code} 
							selected={this.state.selected} 
							setSelected={this.setSelected} 
							key={"CS" + "_" + 0 + "_"  +index}
			                pageView={this.state.pageView}
			                umlEditor={this.umlEditor}>
						</SimpleCode>
			);
		});
	}

	renderNodes(codeSiblings, level) {
		return (
			<div>
    				{this.renderRoots(codeSiblings)}
				</div>
		);
	};

	renderCodesystem() {
		return this.renderNodes(this.state.codesystem);
	}

	render() {
		return (
			<div className="codesystemView">{this.renderCodesystem()}</div>
		);
	}
}