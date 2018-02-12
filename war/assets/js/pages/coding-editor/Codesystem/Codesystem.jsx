import React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactDOM from 'react-dom';

import styled from 'styled-components';

import ReactLoading from '../../../common/ReactLoading.jsx';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import CodesystemEndpoint from '../../../common/endpoints/CodesystemEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import { DragAndDropCode } from './Code.jsx';

import { PageView } from '../View/PageView.js';

import CodesystemToolbar from './CodesystemToolbar.jsx';

import SimpleCodesystem from './SimpleCodesystem.jsx';

const StyledCodeSystemView = styled.div``;

const StyledCodeSystemHeader = styled.div`
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledToolBar = styled.div`
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledCodeSystem = styled.div`
	height: ${props =>
		props.height - (props.codingViewIsVisible ? 300 : 0) + 'px'} !important;

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
export default class Codesystem extends SimpleCodesystem {
	constructor(props) {
		super(props);
		this.state = {
			selected: {},
			codesystemID: -1,
			codesystem: [],
			height: '100px',

			userProfile: {
				name: '',
				email: '',
				picSrc: ''
			}
		};

		this.listenerIDs = {};
		this.codesystemTop = 0;
		this.initUMLEditor = false;

		this.umlEditor = null;

		this.toolbarRef = null;

		this.relocateCode = this.relocateCode.bind(this);
		this.createCode = this.createCode.bind(this);
		this.removeCode = this.removeCode.bind(this);
		this.updateCodingCount = this.updateCodingCount.bind(this);
		this.initCodingCount = this.initCodingCount.bind(this);
		this.shouldHighlightNode = this.shouldHighlightNode.bind(this);
		this.init = this.init.bind(this);

		this.updateUserProfileStatusFromProps(props);
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

	setUmlEditor(umlEditor) {
		this.umlEditor = umlEditor;
	}

	init() {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			CodesystemEndpoint.getCodeSystem(_this.props.codesystemId).then(function(
				resp
			) {
				var codes = resp.items || [];

				var rootCodes = codes.filter(function(code) {
					return !code.parentID;
				});

				for (var i = 0; i < rootCodes.length; i++) {
					rootCodes[i].collapsed = false;
					_this.buildTree(rootCodes[i], codes, false);
				}
				var selected = {};
				if (rootCodes.length > 0) selected = rootCodes[0];
				_this.sortCodes(rootCodes);
				_this.initCodingCount(codes, rootCodes);
				_this.setState({
					codesystem: rootCodes,
					selected: selected,
					codesystemID: _this.props.codesystemId
				});
				$('#codesystemLoadingDiv').addClass('hidden');
				_this.props.umlEditor.codesystemFinishedLoading();
				_this.props.selectionChanged(selected);
				resolve();
			});
		});
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
			var subCodes = allCodes.filter(function(code) {
				return currentCode.subCodesIDs.indexOf(code.codeID) != -1;
			});
			currentCode.children = subCodes;

			subCodes.forEach(subCode => {
				_this.buildTree(subCode, allCodes, true);
			});
		} else {
			currentCode.children = [];
		}
	}

	updateSelected(code, persist) {
		if (persist) {
			this.props.syncService.codes.updateCode(code).catch(() => {
				// Errors are logged in syncService, but need to be catched
			});
		} else {
			Object.assign(this.state.selected, code);
			this.forceUpdate();
		}
	}

	codeRemoved(code) {
		code = this.getCodeById(code.id);

		this.removeAllCodings(code.codeID);

		const parent = this.getCodeByCodeID(code.parentID);
		parent.children = parent.children.filter(child => code != child);

		if (code == this.state.selected) {
			this.setState({
				selected: parent
			});
		}

		this.props.codeRemoved(code);

		// Code is a relationship-code
		if (code.relationshipCode != null) {
			// delete the relationshipCodeId of the relation
			this.getCodeById(code.relationshipCode.key.parent.id).relations.some(
				rel => {
					if (rel.key.id == code.relationshipCode.key.id) {
						rel.relationshipCodeId = null;
						return true;
					}
				}
			);
		}

		// Check the relations of the code. If a relationship belongs to a relationship-code
		// => update the relationship-code and set the relation to null
		const updateRelation = relation => {
			if (relation.relationshipCodeId != null) {
				const relationshipCode = this.getCodeById(relation.relationshipCodeId);
				relationshipCode.relationshipCode = null;
				relationshipCode.mmElementIDs = [];

				this.props.syncService.codes.updateCode(relationshipCode).catch(() => {
					// Errors are logged in syncService, but need to be catched
				});
			}
		};

		const checkCode = c => {
			if (c.relations != null) {
				c.relations.map(rel => updateRelation(rel));
			}

			if (c.children != null) {
				c.children.map(child => checkCode(child));
			}
		};

		checkCode(code);

		this.forceUpdate();
	}

	codeUpdated(code) {
		const existingCode = this.getCodeByCodeID(code.codeID);
		Object.assign(existingCode, code);
		this.forceUpdate();
	}

	createCode(name, mmElementIDs, relationId, relationSourceCodeId, select) {
		// Build the Request Object
		const code = {
			author: this.state.userProfile.name,
			name: name,
			subCodesIDs: [],
			parentID: this.state.selected.codeID,
			codesystemID: this.state.selected.codesystemID,
			color: '#000000',
			mmElementIDs: mmElementIDs != null ? mmElementIDs : []
		};

		this.props.syncService.codes
			.insertCode(code, this.state.selected.id)
			.then(resp => {
				// Update the relation
				if (relationId != null && relationSourceCodeId != null) {
					const relationSourceCode = this.getCodeById(relationSourceCodeId);
					relationSourceCode.relations.some(rel => {
						if (rel.key.id == relationId) {
							rel.relationshipCodeId = resp.id;
							return true;
						}
					});
				}

				if (select) {
					_this.setSelected(resp);
				}
			}).catch(() => {
				// Errors are logged in syncService, but need to be catched
			});
	}

	insertCode(code) {
		const parent = this.getCodeByCodeID(code.parentID);

		code.codingCount = 0;
		code.children = [];
		parent.children.push(code);
		this.updateSubCodeIDs(parent);

		this.forceUpdate();

		this.props.insertCode(code);
	}

	removeCode(code) {
		// root should not be removed
		if (code.codeID == 1) {
			return;
		}

		this.props.syncService.codes.removeCode(code).catch(() => {
			// Errors are logged in syncService, but need to be catched
		});
	}

	initCodingCount(allCodes, rootCodes) {
		const codeIDs = allCodes.map(code => {
			return code.codeID;
		});
		this.props.documentsView
			.calculateCodingCount(codeIDs)
			.then(codingCountMap => {
				allCodes.forEach(code => {
					code.codingCount = codingCountMap.get(code.codeID);
				});
				this.setState({
					codesystem: this.state.codesystem
				});
			});
	}

	async updateCodingCount() {
		const codingCountMap = await this.props.documentsView.calculateCodingCount([
			this.state.selected.codeID
		]);
		this.state.selected.codingCount = codingCountMap.get(
			this.state.selected.codeID
		);
		this.setState({
			selected: this.state.selected,
			codesystem: this.state.codesystem
		});
	}

	updateSubCodeIDs(code) {
		code.subCodesIDs = [];
		code.children.forEach(childCode => {
			code.subCodesIDs.push(childCode.codeID);
		});
	}

	relocateCode(movingNode, targetID) {
		this.props.syncService.codes.relocateCode(movingNode.id, targetID).catch(() => {
			// Errors are logged in syncService, but need to be catched
		});
	}

	onCodeRelocation(code) {
		const newParentID = code.parentID;
		code = this.getCodeById(code.id);

		const sourceNode = this.getCodeByCodeID(code.parentID);
		const indexSrc = sourceNode.children.indexOf(code);
		sourceNode.children.splice(indexSrc, 1);
		this.updateSubCodeIDs(sourceNode);

		code.parentID = newParentID;

		const targetNode = this.getCodeByCodeID(newParentID);
		targetNode.children.push(code);
		this.updateSubCodeIDs(targetNode);
		this.sortCodes(this.state.codesystem);
		this.setState({
			codesystem: this.state.codesystem
		});
	}

	removeAllCodings(codingID) {
		var documents = this.props.documentsView.getDocuments();
		var activeDocId = this.props.documentsView.getActiveDocumentId();

		for (var i in documents) {
			var doc = documents[i];
			var elements = $('<div>' + doc.text + '</div>');
			var originalText = elements.html();
			elements
				.find('coding[code_id=\'' + codingID + '\']')
				.contents()
				.unwrap();
			var strippedText = elements.html();
			if (strippedText !== originalText) {
				doc.text = strippedText;
				this.props.documentsView.changeDocumentData(doc);
				if (activeDocId === doc.id) this.props.textEditor.setHTML(doc.text);
			}
		}
	}

	shouldHighlightNode(code) {
		// Not initialized yet
		if (this.props.umlEditor.getMetaModelMapper() == null) {
			return false;
		}

		// Evaluate actions
		let actions = null;

		if (code.relationshipCode != null) {
			actions = this.props.umlEditor
				.getMetaModelMapper()
				.evaluateActionsForTarget(code.relationshipCode);
		} else {
			actions = this.props.umlEditor
				.getMetaModelMapper()
				.evaluateActionsForTarget(code);
		}

		// Highlight if the mapper returns mapping-actions
		return (
			this.props.pageView == PageView.UML &&
			actions != null &&
			actions.length > 0
		);
	}

	componentDidMount() {
		const syncService = this.props.syncService;
		if (syncService) {
			this.listenerIDs = {
				codeInserted: syncService.on('codeInserted', code =>
					this.insertCode(code)
				),
				codeRelocated: syncService.on('codeRelocated', code =>
					this.onCodeRelocation(code)
				),
				codeRemoved: syncService.on('codeRemoved', code =>
					this.codeRemoved(code)
				),
				codeUpdated: syncService.on('codeUpdated', code =>
					this.codeUpdated(code)
				)
			};
		}
	}

	componentWillUnmount() {
		const syncService = this.props.syncService;
		if (syncService) {
			syncService.off('codeInserted', this.listenerIDs['codeInserted']);
			syncService.off('codeRelocated', this.listenerIDs['codeRelocated']);
			syncService.off('codeRemoved', this.listenerIDs['codeRemoved']);
			syncService.off('codeUpdated', this.listenerIDs['codeUpdated']);
		}
	}

	renderRoot(code, level, key) {
		return (
			<DragAndDropCode
				showSimpleView={false}
				documentsView={this.props.documentsView}
				level={level}
				node={code}
				selected={this.state.selected}
				setSelected={this.setSelected}
				relocateCode={this.relocateCode}
				showFooter={this.props.showFooter}
				key={key}
				isCodeSelectable={this.props.isCodeSelectable}
				shouldHighlightNode={this.shouldHighlightNode}
				getFontWeight={this.props.getFontWeight}
				getTextColor={this.props.getTextColor}
				getBackgroundColor={this.props.getBackgroundColor}
				getBackgroundHoverColor={this.props.getBackgroundHoverColor}
			/>
		);
	}

	renderCodesystemContent() {
		if (this.state.codesystem.length != 0) {
			return this.renderCodesystem();
		} else {
			return <ReactLoading color={'#020202'} />;
		}
	}

	render() {
		if (this.state.codesystemID != this.props.codesystemId) {
			this.init().then(this.props.umlEditor.codesystemFinishedLoading); // if codesystem ID changed, re-initialize+
		}
		const height =
			$(window).height() -
			(this.codesystemRef
				? ReactDOM.findDOMNode(this.codesystemRef).getBoundingClientRect().top
				: 0);
		return (
			<StyledCodeSystemView>
				<StyledCodeSystemHeader>
					<b>
						<FormattedMessage
							id="codesystemcodesystem"
							defaultMessage="Code System"
						/>
					</b>
				</StyledCodeSystemHeader>
				<StyledToolBar>
					<CodesystemToolbar
						ref={r => (this.toolbarRef = r)}
						projectID={this.props.projectID}
						projectType={this.props.projectType}
						selected={this.state.selected}
						createCode={this.createCode}
						removeCode={this.removeCode}
						updateCodingCount={this.updateCodingCount}
						toggleCodingView={this.props.toggleCodingView}
						textEditor={this.props.textEditor}
						documentsView={this.props.documentsView}
						pageView={this.props.pageView}
						getCodeById={this.getCodeById}
						userProfile={this.props.userProfile}
					/>
				</StyledToolBar>

				<StyledCodeSystem
					ref={c => (this.codesystemRef = c)}
					id="codesystemTree"
					className="codesystemView"
					height={height}
					codingViewIsVisible={this.props.codingViewIsVisible}
				>
					{this.renderCodesystemContent()}
				</StyledCodeSystem>
			</StyledCodeSystemView>
		);
	}
}
