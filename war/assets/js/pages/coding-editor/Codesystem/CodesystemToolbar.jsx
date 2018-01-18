import React from 'react';
import styled from 'styled-components';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import Prompt from '../../../common/modals/Prompt';

import {
	PageView
} from '../View/PageView.js';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import Confirm from '../../../common/modals/Confirm';
import CodingsOverview from '../../../common/modals/CodingsOverview/CodingsOverview';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledToolBar = styled.div `
    padding-bottom: 2px;
`;

const StyledBtnGroup = styled.div `
    padding: 0px 2px 2px 2px;
`;


const StyledBtnStack = styled.div `
		font-size: 8px !important;
`;

export default class CodesystemToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userProfile: {
				name: '',
				email: '',
				picSrc: ''
			}
		};

		this.insertCode = this.insertCode.bind(this);
		this.applyCode = this.applyCode.bind(this);
		this.removeCoding = this.removeCoding.bind(this);
		this.showCodingsOverview = this.showCodingsOverview.bind(this);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateUserProfileStatusFromProps(nextProps);
	}

	updateUserProfileStatusFromProps(targetedProps) {
		this.setState({
			userProfile: targetedProps.userProfile
		});
	}

	removeCode(code) {
		const {
			formatMessage
		} = IntlProvider.intl;
		const _this = this;

		if (code.codeID == 1) return; //root should not be removed

		var confirm = new Confirm(formatMessage({
			id: 'codesystemtoolbar.confirm_delete',
			defaultMessage: 'Do you want to delete the code {name}?'
		}, {
			name: code.name
		}));
		confirm.showModal().then(function () {
			CodesEndpoint.removeCode(code).then(function (resp) {
				_this.props.codeRemoved(code.codeID);

				// Code is a relationship-code
				if (code.relationshipCode != null) {
					// delete the relationshipCodeId of the relation
					let sourceCode = _this.props.getCodeById(code.relationshipCode.key.parent.id);

					// find the relation
					let relation = null;

					for (let i = 0; i < sourceCode.relations.length; i++) {
						if (sourceCode.relations[i].key.id == code.relationshipCode.key.id) {
							relation = sourceCode.relations[i];
							break;
						}
					}

					relation.relationshipCodeId = null;
				}

				// Check the relations of the code. If a relationship belongs to a relationship-code
				// => update the relationship-code and set the relation to null
				let updateRelation = (relation) => {
					if (relation.relationshipCodeId != null) {
						let relationshipCode = _this.props.getCodeById(relation.relationshipCodeId);
						relationshipCode.relationshipCode = null;
						relationshipCode.mmElementIDs = [];

						CodesEndpoint.updateCode(relationshipCode).then((resp2) => {
							// Do nothing
						});
					}
				};

				let checkCode = (c) => {
					if (c.relations != null) {
						for (let i = 0; i < c.relations.length; i++) {
							updateRelation(c.relations[i]);
						}
					}

					if (c.children != null) {
						for (let i = 0; i < c.children.length; i++) {
							checkCode(c.children[i]);
						}
					}
				};

				checkCode(code);
			});
		});
	}

	insertCode() {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		var prompt = new Prompt(
			formatMessage({
				id: 'codesystemtoolbar.prompt_name',
				defaultMessage: 'Give your code a name'
			}),
			formatMessage({
				id: 'codesystemtoolbar.prompt_name.sample',
				defaultMessage: 'Code Name'
			})
		);
		prompt.showModal().then(function (codeName) {
			_this.props.createCode(codeName);
		});
	}

	applyCode() {
		var _this = this;
		var selected = this.props.selected;
		ProjectEndpoint.incrCodingId(_this.props.projectID, _this.props.projectType).then(function (resp) {
			var codingID = resp.maxCodingID;
			var author = this.state.userProfile.name;

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

	showCodingsOverview() {
		const {
			formatMessage
		} = IntlProvider.intl;
		var overview = new CodingsOverview(formatMessage({
			id: 'codesystemtoolbar.delete_code',
			defaultMessage: 'Do you want to delete the code?'
		}));
		overview.showModal(this.props.selected.codeID, this.props.documentsView).then(function () {

		});
	}

	renderAddRemoveCodeBtn() {
		if (this.props.projectType != "PROJECT") return "";

		return ([
			<BtnDefault key="applyCodeBtn" className="btn btn-default" onClick={this.insertCode}>
				<i className="fa fa-plus fa-1x"></i>
			</BtnDefault>,
			<BtnDefault key="removeCodeBtn" className="btn btn-default" onClick={this.removeCode.bind(this, this.props.selected)}>
				<i className="fa fa-trash fa-1x"></i>
			</BtnDefault>
		]);
	}

	renderAddRemoveCodingBtn() {
		if (this.props.pageView == PageView.UML) {
			return "";
		}

		return (
			<StyledBtnGroup className="btn-group">
                <BtnDefault className="btn btn-default" onClick={this.applyCode}>
                    <StyledBtnStack className="fa-stack fa-lg">
                        <i className="fa fa-tag fa-stack-2x"></i>
						<i className="fa fa-plus fa-stack-1x fa-inverse"></i>
                    </StyledBtnStack>
                </BtnDefault>
                <BtnDefault className="btn btn-default" onClick={this.removeCoding}>
                    <StyledBtnStack className="fa-stack fa-lg">
                        <i className="fa fa-tag fa-stack-2x"></i>
                        <i className="fa fa-minus fa-stack-1x fa-inverse"></i>
                    </StyledBtnStack>
                </BtnDefault>
            </StyledBtnGroup>
		);
	}

	render() {
		return (
			<StyledToolBar>
				<StyledBtnGroup className="btn-group" >
					{this.renderAddRemoveCodeBtn()}
					<BtnDefault className="btn btn-default" onClick={this.props.toggleCodingView}>
						<i className="fa  fa-list-alt  fa-1x"></i>
					</BtnDefault>
				</StyledBtnGroup>
				<StyledBtnGroup className="btn-group">
					<BtnDefault key="codingsOverview" className="btn btn-default" onClick={this.showCodingsOverview}>
						<i className="fa fa-list fa-1x"></i>
					</BtnDefault>
				</StyledBtnGroup>
				{this.renderAddRemoveCodingBtn()}
			</StyledToolBar>
		);
	}


}