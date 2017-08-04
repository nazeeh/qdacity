import React from 'react';
import styled from 'styled-components';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import CodesystemEndpoint from '../../../common/endpoints/CodesystemEndpoint';
import {
	DragAndDropCode
} from './Code.jsx';
import {
	DragDropContext
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import CodesystemToolbar from "./CodesystemToolbar.jsx"

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import SimpleCodesystem from './SimpleCodesystem.jsx';

const StyledEditorCtrlHeader = styled.div `
	text-align: center;
	position:relative;
	background-color: #e7e7e7;
 `;

const StyledToolBar = styled.div `
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledCodeSystem = styled.div `
    height: ${props => props.height + "px"} !important;
    overflow: auto;
`;

/*
 ** Intended as primary codesystem component
 ** Extende SimpleCodesystem by
 ** (1) adding a Toolbar for adding and removing codes.
 ** (2) connecting the component to the code view and the text editor
 ** (3) wrapping the component in a drag and drop context
 **
 */
class Codesystem extends SimpleCodesystem {
	constructor(props) {
		super(props);
		this.state = {
			slected: {},
			codesystemID: -1,
			codesystem: [],
			height: "100px"
		};
		this.initUMLEditor = false;

		this.relocateCode = this.relocateCode.bind(this);
		this.removeCode = this.removeCode.bind(this);
		this.insertCode = this.insertCode.bind(this);
		this.updateCodingCount = this.updateCodingCount.bind(this);
		this.initCodingCount = this.initCodingCount.bind(this);
		this.init = this.init.bind(this);
	}

	setHeight(height) {
		this.setState({
			height: height
		});
	}

	init() {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
				CodesystemEndpoint.getCodeSystem(_this.props.codesystemId).then(function (resp) {

					var codes = resp.items || [];

					var rootCodes = codes.filter(function (code) {
						return !code.parentID;
					});

					for (var i = 0; i < rootCodes.length; i++) {
						rootCodes[i].collapsed = false;
						_this.buildTree(rootCodes[i], codes, false)
					}
					var selected = {}
					if (rootCodes.length > 0) selected = rootCodes[0];
					_this.sortCodes(rootCodes);
					_this.initCodingCountRecurive(rootCodes);
					_this.setState({
						codesystem: rootCodes,
						selected: selected,
						codesystemID: _this.props.codesystemId,
					});
					$("#codesystemLoadingDiv").addClass("hidden");
					_this.props.umlEditor.codesystemFinishedLoading();
					_this.props.selectionChanged(selected);
					resolve();
				});
			}
		);
		return promise;

	}

	// Overriding super method
	notifyOnSelection(newCode) {
		this.props.selectionChanged(newCode);
	}

	buildTree(currentCode, allCodes, currentNodeCollapsed) {
		var _this = this;
		currentCode.collapsed = currentNodeCollapsed;

		if (currentCode.subCodesIDs) {
			var subCodes = allCodes.filter(function (code) {
				return currentCode.subCodesIDs.indexOf(code.codeID) != -1;
			});
			currentCode.children = subCodes;

			subCodes.forEach((subCode) => {
				_this.buildTree(subCode, allCodes, true)
			});
		} else {
			currentCode.children = [];
		}
	}

	updateSelected(code, persist) {
		if (!persist) {
			Object.assign(this.state.selected, code);
			this.forceUpdate();
		} else this.saveAndUpdate(code)

	}

	saveAndUpdate(code) {
		var _this = this;
		CodesEndpoint.updateCode(code).then(function (resp) {
			_this.updateSelected(resp, false);
		});
	}



	removeCode() {
		var code = this.state.selected;

		this.removeAllCodings(code.codeID);
		var parent = this.getCodeByID(this.state.codesystem, code.parentID)
		var index = parent.children.indexOf(code);
		parent.children.splice(index, 1);
		this.setState({
			selected: parent
		})

		this.props.removeCode(code);
	}

	insertCode(code) {
		code.children = [];
		this.state.selected.children.push(code);
		this.updateSubCodeIDs(this.state.selected);
		var _this = this;
		CodesEndpoint.updateCode(this.state.selected).then(function (resp2) {
			_this.forceUpdate();
		});

		this.props.insertCode(code);
	}

	initCodingCount() {
		this.initCodingCountRecurive(this.state.codesystem);
		this.setState({
			codesystem: this.state.codesystem
		});

	}

	initCodingCountRecurive(codeSiblings) {
		var _this = this;
		codeSiblings.forEach((code) => {
			code.codingCount = this.props.documentsView.calculateCodingCount(code.codeID);
			if (code.children) _this.initCodingCountRecurive(code.children); // recursion
		});
	}
	updateCodingCount() {
		this.state.selected.codingCount = this.props.documentsView.calculateCodingCount(this.state.selected.codeID);
		this.setState({
			selected: this.state.selected,
			codesystem: this.state.codesystem
		});
	}

	updateSubCodeIDs(code) {
		code.subCodesIDs = [];
		code.children.forEach((childCode) => {
			code.subCodesIDs.push(childCode.codeID);
		})
	}

	relocateCode(movingNode, targetID) {
		var relocationPromise = CodesEndpoint.relocateCode(movingNode.id, targetID);
		var targetNode = this.getCodeByID(this.state.codesystem, targetID);
		var sourceNode = this.getCodeByID(this.state.codesystem, movingNode.parentID);
		var indexSrc = sourceNode.children.indexOf(movingNode);

		var _this = this;
		relocationPromise.then(function (resp) {

			sourceNode.children.splice(indexSrc, 1);
			_this.updateSubCodeIDs(sourceNode);

			movingNode.parentID = targetID;

			targetNode.children.push(movingNode);
			_this.updateSubCodeIDs(targetNode);
			_this.sortCodes(_this.state.codesystem);
			_this.setState({
				codesystem: _this.state.codesystem
			})

			console.log("Updated logation of code:" + resp.id + " |  " + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		});
	}

	removeAllCodings(codingID) {
		var documents = this.props.documentsView.getDocuments();
		var activeDocId = this.props.documentsView.getActiveDocumentId();

		for (var i in documents) {
			var doc = documents[i];
			var elements = $('<div>' + doc.text + '</div>');
			var originalText = elements.html();
			elements.find('coding[code_id=\'' + codingID + '\']').contents().unwrap();
			var strippedText = elements.html();
			if (strippedText !== originalText) {
				doc.text = strippedText;
				this.props.documentsView.changeDocumentData(doc);
				if (activeDocId === doc.id) this.props.editorCtrl.setDocumentView(doc);
			}
		}
	}

	renderRoots(codes) {
		return codes.map((code, index) => {
			return (
				<DragAndDropCode
							showSimpleView={false}
							documentsView={this.props.documentsView}
							level={0}
							node={code}
							selected={this.state.selected}
							setSelected={this.setSelected}
							relocateCode={this.relocateCode}
							showFooter={this.props.showFooter}
							key={"CS" + "_" + 0 + "_"  +index}
                            pageView={this.props.pageView}
                            umlEditor={this.props.umlEditor}>
						</DragAndDropCode>
			);
		});
	}



	render() {
		if (this.state.codesystemID != this.props.codesystemId) this.init().then(this.props.umlEditor.codesystemFinishedLoading); // if codesystem ID changed, re-initialize
		return (
			<div>
				<StyledEditorCtrlHeader >
					<b>Code System</b>
				</StyledEditorCtrlHeader>
				<StyledToolBar>
					<CodesystemToolbar
						projectID={this.props.projectID}
						projectType={this.props.projectType}
						selected={this.state.selected}
						account={this.props.account}
						removeCode={this.removeCode}
						insertCode={this.insertCode}
						updateCodingCount={this.updateCodingCount}
						toggleCodingView={this.props.toggleCodingView}
						editorCtrl={this.props.editorCtrl}
						documentsView={this.props.documentsView}
                        umlEditorEnabled={this.props.umlEditorEnabled}
                        pageView={this.props.pageView}>
					</CodesystemToolbar>
				</StyledToolBar>
				<StyledCodeSystem id="codesystemTree" className="codesystemView" height={this.state.height}>{this.renderCodesystem()}</StyledCodeSystem>
			</div>
		);
	}
}

export default DragDropContext(HTML5Backend)(Codesystem);