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
import { BtnDefault, BtnGroup } from '../../common/styles/Btn.jsx';
import DropDownButton from '../../common/styles/DropDownButton.jsx';
import NumberField from '../../common/styles/NumberField.jsx';

import TextEditor from './TextEditor.jsx';

import EditorCtrl from './EditorCtrl';
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
`;

const StyledEditorToolbar = styled.div`
	display: ${props =>
		props.selectedEditor === PageView.TEXT ? 'flex' : 'none'} !important;
	text-align: center;
	padding: 5px;
`;

const StyledTextEditorMenu = styled.div`
	display: ${props =>
		props.selectedEditor === PageView.TEXT ? 'block' : 'none'} !important;
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
`;

const StyledPlaceholder = styled.div`
	flex-grow: 1;
`;

const StyledFooter = styled.div`
	grid-area: footer;
	display: ${props => (props.showCodingView ? 'block' : 'none')} !important;
	z-index: 1;
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
		this.syncService = new SyncService();
		this.state = {
			project: project,
			editorCtrl: {},
			showCodingView: false,
			showAgreementMap: urlParams.report ? true : false,
			selectedCode: {},
			selectedEditor: PageView.CODING,
			bottomPanelType: BottomPanelType.SEARCHRESULTS,
			searchResults: {
				documentResults: []
			},
			mxGraphLoaded: false,
			fontSize: 13,

			userProfile: {
				name: '',
				email: '',
				picSrc: ''
			}
		};

		this.props.mxGraphPromise.then(() => {
			this.setState({
				mxGraphLoaded: true
			});
		});

		this._handleFontSizeChange = this._handleFontSizeChange.bind(this);

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
		this.initEditorCtrl = this.initEditorCtrl.bind(this);
		this.setSearchResults = this.setSearchResults.bind(this);
		this.updateUserAtSyncService = this.updateUserAtSyncService.bind(this);
		this.updateUserStatusFromProps = this.updateUserStatusFromProps.bind(this);

		// update on initialization
		this.updateUserStatusFromProps(props);

		scroll(0, 0);
		window.onresize = this.resizeElements;
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateUserStatusFromProps(nextProps);
	}

	updateUserAtSyncService() {
		const _this = this;
		this.props.auth.authentication.getProfile().then((profile) => {
			_this.syncService.updateUser({
				name: profile.name,
				email: profile.email,
				picSrc: profile.thumbnail,
				project: _this.state.project.id,
				token: _this.props.auth.authentication.getToken() + " google" //FIXME this is just a workaround since the provider type was missing at the end of the token
			});
		})
	}

	updateUserStatusFromProps(targetedProps) {
		const _this = this;
		targetedProps.auth.authentication.getProfile().then(function(profile) {
			_this.setState({
				userProfile: {
					name: profile.name,
					email: profile.email,
					picSrc: profile.thumbnail
				}
			});
			_this.syncService.updateUser({
				name: profile.name,
				email: profile.email,
				picSrc: profile.thumbnail,
				project: _this.state.project.id,
				token: _this.props.auth.authentication.getToken() + " google" //FIXME this is just a workaround since the provider type was missing at the end of the token
			});
		});
	}

	componentDidMount() {
		this.updateUserAtSyncService();

		document.getElementsByTagName('body')[0].style['overflow-y'] = 'hidden';
		if (this.state.userProfile.email !== '') {
			this.syncService.logon(this.state.userProfile);
		}
	}

	componentDidMount() {
		document.getElementsByTagName('body')[0].style['overflow-y'] = 'hidden';
	}

	componentWillUnmount() {
		this.syncService.disconnect();

		document.getElementsByTagName('body')[0].style['overflow-y'] = '';
	}

	init() {
		const _this = this;
		var project = this.state.project;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(
			function(resp) {
				project.setCodesystemID(resp.codesystemID);
				project.setUmlEditorEnabled(resp.umlEditorEnabled);
				_this.setState({
					project: project
				});
			}
		).catch(()=>{console.log("could not load project")});
	}

	resizeElements() {
		this.state.editorCtrl.addCodingBrackets();
		this.forceUpdate();
	}

	initEditorCtrl() {
		this.setState({
			editorCtrl: new EditorCtrl(
				this.getCodeByCodeID,
				this.state.showAgreementMap
			)
		});
	}

	changeView(view) {}

	viewChanged(view) {
		if (this.state.editorCtrl.setReadOnly) {
			if (view === PageView.TEXT) {
				this.state.editorCtrl.setReadOnly(false);
			} else {
				this.state.editorCtrl.setReadOnly(true);
			}
		}

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

	_setFontFace(fontface) {
		this.state.editorCtrl.setFontFace(fontface);
	}

	_handleFontSizeChange(e) {
		const fontSize = e.target.value;
		this.setState({
			fontSize
		});
		this.state.editorCtrl.setFontSize(fontSize);
		e.target.focus();
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn ||
			!this.props.auth.authState.isUserRegistered
		)
			return <UnauthenticatedUserPanel history={this.props.history} />;
		if (this.state.project.getCodesystemID() == -1) this.init();

		const fonts = [
			{
				text: 'Arial',
				onClick: () => this._setFontFace('Arial')
			},
			{
				text: 'Arial Black',
				onClick: () => this._setFontFace('Arial Black')
			},
			{
				text: 'Comic Sans MS',
				onClick: () => this._setFontFace('Comic Sans MS')
			},
			{
				text: 'Courier New',
				onClick: () => this._setFontFace('Courier New')
			},
			{
				text: 'Georgia',
				onClick: () => this._setFontFace('Georgia')
			},
			{
				text: 'Impact',
				onClick: () => this._setFontFace('Impact')
			},
			{
				text: 'Lucida Console',
				onClick: () => this._setFontFace('Lucida Console')
			},
			{
				text: 'Palatino Linotype',
				onClick: () => this._setFontFace('Palatino Linotype')
			},
			{
				text: 'Tahoma',
				onClick: () => this._setFontFace('Tahoma')
			},
			{
				text: 'Times New Roman',
				onClick: () => this._setFontFace('Times New Roman')
			},
			{
				text: 'Trebuchet MS',
				onClick: () => this._setFontFace('Trebuchet MS')
			},
			{
				text: 'Verdana',
				onClick: () => this._setFontFace('Verdana')
			}
		];

		return (
			<StyledCodingEditor
				height={$(window).height()}
				showCodingView={this.state.showCodingView}
			>
				<StyledSideBar>
					<StyledSideBarEditor>
						<div>
							<div id="agreementMapSettings" className="hidden">
								<p>
									<span>
										<FormattedMessage
											id="coding.editor.false_negatives"
											defaultMesage="Showing False Negatives"
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
									editorCtrl={this.state.editorCtrl}
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
							editorCtrl={this.state.editorCtrl}
							umlEditorEnabled={this.state.project.isUmlEditorEnabled()}
							showFooter={this.showCodingView}
							selectionChanged={this.selectionChanged}
							insertCode={this.insertCode}
							codeRemoved={this.codeRemoved}
							documentsView={this.documentsViewRef}
							syncService={this.syncService}
							userProfile={this.state.userProfile}
						/>
					</StyledSideBarCodesystem>
				</StyledSideBar>
				<StyledEditor>
					<div id="textdocument-ui">
						<StyledEditorToolbar selectedEditor={this.state.selectedEditor}>
							<StyledTextEditorMenu selectedEditor={this.state.selectedEditor}>
								<BtnGroup>
									<BtnDefault id="btnTxtBold">
										<i className="fa fa-bold" />
									</BtnDefault>
									<BtnDefault id="btnTxtItalic">
										<i className="fa fa-italic" />
									</BtnDefault>
									<BtnDefault id="btnTxtUnderline">
										<i className="fa fa-underline" />
									</BtnDefault>
								</BtnGroup>

								<BtnGroup>
									<DropDownButton
										initText={'Select a font...'}
										items={fonts}
										fixedWidth={'150px'}
									/>
									<NumberField
										key="fontSizeField"
										onChange={this._handleFontSizeChange}
										value={this.state.fontSize}
										style={{ width: '50px' }}
									/>
								</BtnGroup>
							</StyledTextEditorMenu>
							<StyledPlaceholder />
						</StyledEditorToolbar>
						<TextEditor
							initEditorCtrl={this.initEditorCtrl}
							selectedEditor={this.state.selectedEditor}
							showCodingView={this.state.showCodingView}
						/>
						<StyledUMLEditor
							selectedEditor={this.state.selectedEditor}
							showCodingView={this.state.showCodingView}
							id="editor"
						>
							{this.renderUMLEditor()}
						</StyledUMLEditor>
					</div>
				</StyledEditor>
				<StyledFooter showCodingView={this.state.showCodingView}>
					<BottomPanel
						ref={c => {
							if (c) this.codeViewRef = c;
						}}
						panelType={this.state.bottomPanelType}
						searchResults={this.state.searchResults}
						code={this.state.selectedCode}
						editorCtrl={this.state.editorCtrl}
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
