import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import UmlEditor from '../uml-editor/UmlEditor.jsx';
import DocumentsView from './Documents/DocumentsView.jsx';
import Codesystem from './Codesystem/Codesystem.jsx';
import BottomPanel from './BottomPanel/BottomPanel.jsx';
import ProjectPanel from './ProjectPanel/ProjectPanel.jsx';

import TextEditor from './TextEditor/TextEditor.jsx';

import Project from '../project-dashboard/Project';
import { PageView } from './View/PageView.js';
import { BottomPanelType } from './BottomPanel/BottomPanelType.js';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesEndpoint from '../../common/endpoints/CodesEndpoint';
import SyncService from '../../common/SyncService';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

const StyledCodingEditor = styled.div`
	padding-top: 51px;
	display: grid;
	grid-template-columns: 3fr 14fr;
	grid-template-areas:
		'sidebarEdior editor'
		'sidebarDocuments editor'
		'sidebarCodesystem editor'
		'footer footer';
	height: ${props => props.height}px;
`;

const StyledEditableToggle = styled.a`
	display: ${props =>
		props.selectedEditor === PageView.TEXT ? 'block' : 'none'} !important;
	color: #000;
`;

const StyledSideBar = styled.div``;

const StyledSideBarEditor = styled.div`
	grid-area: sidebarEdior;
`;

const StyledSideBarDocuments = styled.div`
	grid-area: sidebarDocuments;
`;

const StyledSideBarCodesystem = styled.div`
	grid-area: sidebarCodesystem;
	min-width: 0;
	word-break: break-all;
`;

const StyledEditor = styled.div`
	grid-area: editor;
	min-width: 0;
	overflow: hidden;
`;

const StyledTextdocumentUi = styled.div`
	height: 100%;
`;

const StyledFooter = styled.div`
	grid-area: footer;
	display: ${props => (props.showCodingView ? 'block' : 'none')} !important;
	z-index: 1;
	height: 300px;
`;

const StyledUMLEditor = styled.div`
	height: ${props =>
		props.showCodingView
			? 'calc(100vh - 350px)'
			: 'calc(100vh - 51px)'} !important;
	display: ${props =>
		props.selectedEditor === PageView.UML ? 'block' : 'none'} !important;
`;

const StyledDocumentsView = styled.div`
	display: ${props =>
		props.selectedEditor != PageView.UML ? 'block' : 'none'} !important;
`;

class CodingEditor extends React.Component {
	constructor(props) {
		super(props);

		//TODO shared code with project-dashboard
		var urlParams = URI(window.location.search).query(true);
		var projectType = urlParams.type ? urlParams.type : 'PROJECT';
		var project = new Project(urlParams.project, projectType);

		this.report = urlParams.report;
		this.documentsViewRef = {};
		this.codesystemViewRef = {};
		this.umlEditorRef = {};
		this.codeViewRef = {};
		this.textEditor = {};
		this.syncService = new SyncService();
		this.state = {
			project: project,
			showCodingView: false,
			showAgreementMap: urlParams.report ? true : false,
			agreementMapHighlightThreshold: 100,
			selectedCode: {},
			selectedEditor: PageView.CODING,
			bottomPanelType: BottomPanelType.SEARCHRESULTS,
			searchResults: {
				documentResults: []
			},
			mxGraphLoaded: false
		};

		this.props.mxGraphPromise.then(() => {
			this.setState({
				mxGraphLoaded: true
			});
		});

		const _this = this;

		this.toggleCodingView = this.toggleCodingView.bind(this);
		this.hideCodingView = this.hideCodingView.bind(this);
		this.selectionChanged = this.selectionChanged.bind(this);
		this.updateSelectedCode = this.updateSelectedCode.bind(this);
		this.viewChanged = this.viewChanged.bind(this);
		this.getCodeSystem = this.getCodeSystem.bind(this);
		this.getCodeById = this.getCodeById.bind(this);
		this.getCodeByCodeID = this.getCodeByCodeID.bind(this);
		this.showCodingView = this.showCodingView.bind(this);
		this.createCode = this.createCode.bind(this);
		this.deleteCode = this.deleteCode.bind(this);
		this.selectCode = this.selectCode.bind(this);
		this.insertCode = this.insertCode.bind(this);
		this.codeRemoved = this.codeRemoved.bind(this);
		this.deleteRelationship = this.deleteRelationship.bind(this);
		this.resizeElements = this.resizeElements.bind(this);
		this.setSearchResults = this.setSearchResults.bind(this);
		this.updateUserAtSyncService = this.updateUserAtSyncService.bind(this);

		scroll(0, 0);
		window.onresize = this.resizeElements;
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		updateUserAtSyncService();
	}

	updateUserAtSyncService() {
		this.syncService.updateUser({
			name: this.props.auth.userProfile.name,
			email: this.props.auth.userProfile.email,
			picSrc: this.props.auth.userProfile.picSrc,
			project: this.state.project.id,
			token: this.props.auth.authentication.getToken() + ' google' //FIXME this is just a workaround since the provider type was missing at the end of the token
		});
	}

	componentDidMount() {
		this.updateUserAtSyncService();

		document.getElementsByTagName('body')[0].style['overflow-y'] = 'hidden';
	}

	componentWillUnmount() {
		this.syncService.disconnect();

		document.getElementsByTagName('body')[0].style['overflow-y'] = '';
	}

	init() {
		const _this = this;
		var project = this.state.project;
		ProjectEndpoint.getProject(project.getId(), project.getType())
			.then(function(resp) {
				project.setCodesystemID(resp.codesystemID);
				project.setUmlEditorEnabled(resp.umlEditorEnabled);
				_this.setState({
					project: project
				});
			})
			.catch(() => {
				console.log('could not load project');
			});
	}

	resizeElements() {
		this.forceUpdate();
	}

	changeView(view) {}

	viewChanged(view) {
		this.setState({
			selectedEditor: view
		});
	}

	setSearchResults(results) {
		this.setState({
			searchResults: results,
			bottomPanelType: BottomPanelType.SEARCHRESULTS,
			showCodingView: true
		});
	}

	getCodeById(id) {
		return this.codesystemViewRef.getCodeById(id);
	}

	getCodeByCodeID(codeID) {
		return this.codesystemViewRef.getCodeByCodeID(codeID);
	}

	toggleCodingView() {
		let showCodingView = !this.state.showCodingView;
		if (this.state.bottomPanelType === BottomPanelType.SEARCHRESULTS)
			showCodingView = true;
		this.setState({
			showCodingView: showCodingView,
			bottomPanelType: BottomPanelType.CODEVIEW
		});
	}

	deleteRelationship(codeId, relationId, callback) {
		const _this = this;

		let code = this.getCodeById(codeId);
		let relation = code.relations.find(rel => rel.key.id == relationId);

		CodesEndpoint.removeRelationship(codeId, relationId).then(function(resp) {
			// If the relationship belongs to a relationship-code, update the relationship-code and set the relation to null
			if (relation.relationshipCodeId != null) {
				let relationshipCode = _this.getCodeById(relation.relationshipCodeId);
				relationshipCode.relationshipCode = null;
				relationshipCode.mmElementIDs = [];

				this.syncService.codes.updateCode(relationshipCode);
			}

			code.relations = resp.relations;

			_this.updateSelectedCode(code);

			if (callback != null) {
				callback(code, relation);
			}
		});
	}

	selectCode(code) {
		this.codesystemViewRef.setSelected(code);
	}

	selectionChanged(newCode) {
		this.setState({
			selectedCode: newCode
		});
		this.umlEditorRef.codesystemSelectionChanged(newCode);
	}

	createCode(name, mmElementIDs, relationId, relationSourceCodeId, select) {
		this.codesystemViewRef.createCode(
			name,
			mmElementIDs,
			relationId,
			relationSourceCodeId,
			select
		);
	}

	deleteCode(code) {
		this.codesystemViewRef.removeCode(code);
	}

	insertCode(code) {
		this.umlEditorRef.codeUpdated(code);
	}

	codeRemoved(code) {
		this.umlEditorRef.codeRemoved(code);
	}

	getCodeSystem() {
		return this.codesystemViewRef.getCodesystem();
	}

	hideCodingView() {
		this.setState({
			showCodingView: false
		});
	}

	showCodingView() {
		this.setState({
			bottomPanelType: BottomPanelType.CODEVIEW,
			showCodingView: true
		});
	}

	showSearchResults() {
		this.setState({
			bottomPanelType: BottomPanelType.SEARCHRESULTS,
			showCodingView: true
		});
	}

	updateSelectedCode(code, persist) {
		if (code.id == this.codesystemViewRef.getSelected().id) {
			this.codesystemViewRef.updateSelected(code, persist);
		}
		this.umlEditorRef.codeUpdated(code);
	}

	renderUMLEditor() {
		if (this.state.mxGraphLoaded) {
			return (
				<UmlEditor
					ref={c => {
						if (c) this.umlEditorRef = c;
					}}
					codesystemId={this.state.project.getCodesystemID()}
					codesystemView={this.codesystemViewRef}
					getCodeById={this.getCodeById}
					getCodeByCodeId={this.getCodeByCodeID}
					updateCode={this.updateSelectedCode}
					refreshCodeView={this.codeViewRef.updateCode}
					createCode={this.createCode}
					deleteCode={this.deleteCode}
					toggleCodingView={this.toggleCodingView}
					deleteRelationship={this.deleteRelationship}
				/>
			);
		}
		return null;
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn ||
			!this.props.auth.authState.isUserRegistered
		)
			return <UnauthenticatedUserPanel history={this.props.history} />;
		if (this.state.project.getCodesystemID() == -1) this.init();

		return (
			<StyledCodingEditor
				height={$(window).height()}
				showCodingView={this.state.showCodingView}
			>
				<StyledSideBar>
					<StyledSideBarEditor>
						<div>
							<div
								id="agreementMapSettings"
								className={this.state.showAgreementMap ? '' : 'hidden'}
							>
								<p>
									<span>
										<FormattedMessage
											id="coding.editor.false_negatives"
											defaultMessage="Showing False Negatives"
										/>{' '}
										>={' '}
									</span>
									<span id="maxFalseNeg" className="falseNegValue" />
								</p>
								<div id="agreementMapSlider" className="agreementMapSlider" />
							</div>
							<ProjectPanel
								resizeElements={this.resizeElements}
								codesystemView={this.codesystemViewRef}
								viewChanged={this.viewChanged}
								setSearchResults={this.setSearchResults}
								project={this.state.project}
								history={this.props.history}
								documentsView={this.documentsViewRef}
								showCodingView={this.showCodingView}
								selectedEditor={this.state.selectedEditor}
								syncService={this.syncService}
							/>
						</div>
					</StyledSideBarEditor>
					<StyledSideBarDocuments>
						<div id="documents-ui">
							<StyledDocumentsView selectedEditor={this.state.selectedEditor}>
								<DocumentsView
									ref={c => (this.documentsViewRef = c)}
									textEditor={this.textEditor}
									projectID={this.state.project.getId()}
									projectType={this.state.project.getType()}
									report={this.report}
									syncService={this.syncService}
								/>
							</StyledDocumentsView>
						</div>
					</StyledSideBarDocuments>
					<StyledSideBarCodesystem>
						<Codesystem
							ref={c => {
								if (c) this.codesystemViewRef = c;
							}}
							codingViewIsVisible={this.state.showCodingView}
							pageView={this.state.selectedEditor}
							umlEditor={this.umlEditorRef}
							projectID={this.state.project.getId()}
							projectType={this.state.project.getType()}
							auth={this.props.auth}
							codesystemId={this.state.project.getCodesystemID()}
							toggleCodingView={this.toggleCodingView}
							textEditor={this.textEditor}
							umlEditorEnabled={this.state.project.isUmlEditorEnabled()}
							showFooter={this.showCodingView}
							selectionChanged={this.selectionChanged}
							insertCode={this.insertCode}
							codeRemoved={this.codeRemoved}
							documentsView={this.documentsViewRef}
							syncService={this.syncService}
							userProfile={this.props.auth.userProfile}
						/>
					</StyledSideBarCodesystem>
				</StyledSideBar>
				<StyledEditor>
					<StyledTextdocumentUi>
						<TextEditor
							ref={r => (this.textEditor = r)}
							selectedEditor={this.state.selectedEditor}
							textEditable={this.state.selectedEditor === PageView.TEXT}
							projectID={this.state.project.getId()}
							projectType={this.state.project.getType()}
							getCodeByCodeID={this.getCodeByCodeID}
							showAgreementMap={this.state.showAgreementMap}
							agreementMapHighlightThreshold={
								this.state.agreementMapHighlightThreshold
							}
						/>
						<StyledUMLEditor
							selectedEditor={this.state.selectedEditor}
							showCodingView={this.state.showCodingView}
							id="editor"
						>
							{this.renderUMLEditor()}
						</StyledUMLEditor>
					</StyledTextdocumentUi>
				</StyledEditor>
				<StyledFooter showCodingView={this.state.showCodingView}>
					<BottomPanel
						ref={c => {
							if (c) this.codeViewRef = c;
						}}
						panelType={this.state.bottomPanelType}
						searchResults={this.state.searchResults}
						code={this.state.selectedCode}
						textEditor={this.textEditor}
						documentsView={this.documentsViewRef}
						updateSelectedCode={this.updateSelectedCode}
						getCodeById={this.getCodeById}
						getCodeByCodeID={this.getCodeByCodeID}
						getCodeSystem={this.getCodeSystem}
						createCode={this.createCode}
						selectCode={this.selectCode}
						hideCodingView={this.hideCodingView}
						deleteRelationship={this.deleteRelationship}
						codingEditor={this}
					/>
				</StyledFooter>
			</StyledCodingEditor>
		);
	}
}

export default DragDropContext(HTML5Backend)(CodingEditor);
