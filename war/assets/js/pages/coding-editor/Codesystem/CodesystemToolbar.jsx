import React from 'react';

import Prompt from '../../../common/modals/Prompt';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

const StyledToolBar = styled.div `
    padding-bottom: 2px;
`;

const StyledBtnGroup = styled.div `
    padding: 0px 1px 0px 1px;
`;

export default class CodesystemToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.removeCode = this.removeCode.bind(this);
		this.insertCode = this.insertCode.bind(this);
		this.applyCode = this.applyCode.bind(this);
		this.removeCoding = this.removeCoding.bind(this);
		this.openUMLEditor = this.openUMLEditor.bind(this);
	}

	removeCode() {
		var code = this.props.selected;
		if (code.codeID == 1) return; //root should not be removed

		var _this = this;
		CodesEndpoint.removeCode(code).then(function (resp) {
			_this.props.removeCode(code.codeID);
		});
	}

	insertCode() {
		var _this = this;
		var prompt = new Prompt('Give your code a name', 'Code Name');
		prompt.showModal().then(function (codeName) {

			// Build the Request Object
			var code = {
				author: _this.props.account.getProfile().getName(),
				name: codeName,
				subCodesIDs: new Array(),
				parentID: _this.props.selected.codeID,
				codesystemID: _this.props.selected.codesystemID,
				color: "#000000"
			};

			CodesEndpoint.insertCode(code).then(function (resp) {
				_this.props.insertCode(resp);
			});
		});
	}

	applyCode() {
		var _this = this;
		var selected = this.props.selected;
		ProjectEndpoint.incrCodingId(_this.props.projectID, _this.props.projectType).then(function (resp) {
			var codingID = resp.maxCodingID;
			var author = _this.props.account.getProfile().getName();

			_this.props.editorCtrl.setCoding(codingID, selected.codeID, selected.name, author);
			//_this.props.documentsView.updateCurrentDocument(_this.props.editorCtrl.getHTML());
			_this.props.documentsView.applyCodeToCurrentDocument(_this.props.editorCtrl.getHTML(), selected);
			_this.props.updateCodingCount();
		});
	}

	removeCoding() {
		var _this = this;
		var selected = this.props.selected;
		var slection = _this.props.editorCtrl.removeCoding(selected.codeID);
		this.splitupCoding(slection, selected.codeID).then(function (value) {
			_this.props.documentsView.updateCurrentDocument(_this.props.editorCtrl.getHTML());
			_this.props.editorCtrl.addCodingBrackets();
			_this.props.updateCodingCount();
		});
	}

	openUMLEditor() {
		window.location.href = 'uml-editor.html?project=' + this.props.projectID + '&type=' + this.props.projectType;
	}

	splitupCoding(selection, codeID) {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
				var anchor = $(selection._sel.anchorNode);
				var codingID = anchor.prev('coding[code_id=' + codeID + ']').attr('id');
				if (typeof codingID == 'undefined') codingID = anchor.parentsUntil('p').parent().prev().find('coding[code_id=' + codeID + ']').last().attr('id');
				if (typeof codingID == 'undefined') codingID = anchor.parent().prev().find('coding[code_id=' + codeID + ']').last().attr('id'); // Case beginning of paragraph to middle of paragraph

				if (typeof codingID != 'undefined') {
					ProjectEndpoint.incrCodingId(_this.props.projectID, _this.props.projectType).then(function (resp) {
						anchor.nextAll('coding[id=' + codingID + ']').attr("id", resp.maxCodingID);
						anchor.parentsUntil('p').parent().nextAll().find('coding[id=' + codingID + ']').attr("id", resp.maxCodingID);
						anchor.parent().nextAll().find('coding[id=' + codingID + ']').attr("id", resp.maxCodingID); // Case beginning of paragraph to middle of paragraph
						resolve();
					});
				} else {
					resolve();
				}
			}
		);

		return promise;
	}

	renderUmlEditorBtn() {
		if (!this.props.umlEditorEnabled) return "";
		return (
			<StyledBtnGroup className="btn-group">
				<a className="btn btn-default" onClick={this.openUMLEditor}>
					<i className="fa fa-external-link fa-1x"></i>
				</a>
			</StyledBtnGroup>
		);
	}

	renderAddRemoveCodeBtn() {
		if (this.props.projectType != "PROJECT") return "";

		return ([
			<a key="applyCodeBtn" className="btn btn-default" onClick={this.insertCode}>
				<i className="fa fa-plus fa-1x"></i>
			</a>,
			<a key="removeCodeBtn" className="btn btn-default" onClick={this.removeCode}>
				<i className="fa fa-trash fa-1x"></i>
			</a>
		]);
	}

	render() {
		return (
			<StyledToolBar>
				<StyledBtnGroup className="btn-group" >
					{this.renderAddRemoveCodeBtn()}
					<a className="btn btn-default" onClick={this.props.toggleCodingView}>
						<i className="fa  fa-list-alt  fa-1x"></i>
					</a>
				</StyledBtnGroup>
				<StyledBtnGroup className="btn-group"}>
					<a className="btn btn-default" onClick={this.applyCode}>
						<span className="fa-stack fa-lg" style={{fontSize: "8px"}}>
							<i className="fa fa-tag fa-stack-2x"></i>
							<i className="fa fa-plus fa-stack-1x fa-inverse"></i>
						</span>
					</a>
					<a className="btn btn-default" onClick={this.removeCoding}>
						<span className="fa-stack fa-lg" style={{fontSize: "8px"}}>
							<i className="fa fa-tag fa-stack-2x"></i>
							<i className="fa fa-minus fa-stack-1x fa-inverse"></i>
						</span>
					</a>
				</StyledBtnGroup>
				{this.renderUmlEditorBtn()}
			</StyledToolBar>
		);
	}


}