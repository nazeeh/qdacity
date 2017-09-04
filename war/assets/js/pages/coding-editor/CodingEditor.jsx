import React from 'react'
import styled from 'styled-components';

import UmlEditor from '../uml-editor/UmlEditor.jsx';
import DocumentsView from './Documents/DocumentsView.jsx';
import Codesystem from './Codesystem/Codesystem.jsx';
import CodeView from './CodeView/CodeView.jsx';
import PageViewChooser from './View/PageViewChooser.jsx';
import ProjectDashboardBtn from './ProjectDashboardBtn.jsx';
import TextEditor from './TextEditor.jsx';

import EditorCtrl from './EditorCtrl';
import Project from '../project-dashboard/Project';
import {
	PageView
} from './View/PageView.js';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';


const StyledCodingEditor = styled.div `
	padding-top: 51px;
	display: grid;
	grid-template-columns: 3fr 14fr;
	grid-template-areas:
		"sidebarEdior editor"
		"sidebarDocuments editor"
		"sidebarCodesystem editor"
		"footer footer";
`;

const StyledTextEditorMenu = styled.div `
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
	text-align: center;
	padding-top: 10px;
	background-color: #e7e7e7;
`

const StyledPanelHeader = styled.div `
	text-align: center;
	position:relative;
	background-color: #e7e7e7;
 `;

const StyledSettingsPanel = styled.div `
	display: ${props => (props.showPanel) ? 'block' : 'none'} !important;
	background-color: #f8f8f8;
`;

const StyledEditableToggle = styled.a `
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
	color: #000;
`;


const StyledSideBar = styled.div `
`;

const StyledSideBarEditor = styled.div `
	grid-area: sidebarEdior;
`;

const StyledSideBarDocuments = styled.div `
	grid-area: sidebarDocuments;
`;

const StyledSideBarCodesystem = styled.div `
	grid-area: sidebarCodesystem;
`;

const StyledEditor = styled.div `
	grid-area: editor;
`;

const StyledFooter = styled.div `
	grid-area: footer;
	display: ${props => props.showCodingView ? 'block' : 'none'} !important;
	z-index: 1;
`;


const StyledUMLEditor = styled.div `
	height: ${props => props.showCodingView ? 'calc(100vh - 350px)' : 'calc(100vh - 51px)'} !important;
	display: ${props => (props.selectedEditor === PageView.UML) ? 'block' : 'none'} !important;
`;

const StyledDocumentsView = styled.div `
	display: ${props => (props.selectedEditor != PageView.UML) ? 'block' : 'none'} !important;
`;


export default class CodingEditor extends React.Component {
	constructor(props) {
		super(props);

		//TODO shared code with project-dashboard
		var urlParams = URI(window.location.search).query(true);
		var projectType = (urlParams.type ? urlParams.type : 'PROJECT');
		var project = new Project(urlParams.project, projectType);

		this.report = urlParams.report;
		this.documentsViewRef = {};
		this.codesystemViewRef = {};
		this.umlEditorRef = {};
		this.codeViewRef = {};
		this.state = {
			project: project,
			editorCtrl: {},
			showCodingView: false,
			selectedCode: {},
			selectedEditor: PageView.CODING,
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
		this.selectCode = this.selectCode.bind(this);
		this.insertCode = this.insertCode.bind(this);
		this.removeCode = this.removeCode.bind(this);
		this.resizeElements = this.resizeElements.bind(this);
		this.initEditorCtrl = this.initEditorCtrl.bind(this);

		window.onresize = this.resizeElements;

	}

	init() {
		const _this = this;
		var project = this.state.project;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
			project.setCodesystemID(resp.codesystemID);
			project.setUmlEditorEnabled(resp.umlEditorEnabled);
			_this.setState({
				project: project
			});
		});
	}

	resizeElements() {
		this.state.editorCtrl.addCodingBrackets();
		this.forceUpdate();
	}

	initEditorCtrl() {
		this.setState({
			editorCtrl: new EditorCtrl(this.getCodeByCodeID)
		});
	}

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

	getCodeById(id) {
		return this.codesystemViewRef.getCodeById(id);
	}

	getCodeByCodeID(codeID) {
		return this.codesystemViewRef.getCodeByCodeID(codeID);
	}

	toggleCodingView() {
		this.setState({
			showCodingView: !this.state.showCodingView
		});
	}

	selectCode(code) {
		this.codesystemViewRef.setSelected(code);
	}

	selectionChanged(newCode) {
		this.setState({
			selectedCode: newCode
		});
	}

	createCode(name, mmElementIDs, relationId, relationSourceCodeId, select) {
		this.codesystemViewRef.createCode(name, mmElementIDs, relationId, relationSourceCodeId, select);
	}

	insertCode(code) {
		this.umlEditorRef.codeUpdated(code);
	}

	removeCode(code) {
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
			showCodingView: true
		});
	}


	updateSelectedCode(code, persist) {
		this.codesystemViewRef.updateSelected(code, persist);
		this.umlEditorRef.codeUpdated(code);
	}

	renderUMLEditor() {
		if (this.state.mxGraphLoaded) return <UmlEditor ref={(c) => {if (c) this.umlEditorRef = c;}} codesystemId={this.state.project.getCodesystemID()} codesystemView={this.codesystemViewRef} updateCode={this.updateSelectedCode} refreshCodeView={this.codeViewRef.updateCode} createCode={this.createCode} />;
		return null;
	}

	render() {
		if (!this.props.account.getProfile || !this.props.account.isSignedIn()) return null;
		if (this.state.project.getCodesystemID() == -1) this.init();
		return (
			<StyledCodingEditor height={$(window).height()} showCodingView={this.state.showCodingView} >
			<StyledSideBar>
				<StyledSideBarEditor>
					<div id="project-ui" >
						<div >

							<div >
								<ProjectDashboardBtn project={this.state.project} history={this.props.history}/>
								<div id="agreementMapSettings" className="hidden">
									<p>
									  <span>Showing False Negatives >= </span>
									  <span id="maxFalseNeg" className="falseNegValue"></span>
									</p>
									<div id="agreementMapSlider" className="agreementMapSlider"></div>
								</div>

								<div className="row no-gutters" >
								<StyledSettingsPanel showPanel={this.state.project.getType() === "PROJECT"}>
									<StyledPanelHeader>
										<b>Editor</b>
									</StyledPanelHeader>
									<div>
										<PageViewChooser umlEditorEnabled={this.state.project.isUmlEditorEnabled()} viewChanged={this.viewChanged}/>
									</div>
								</StyledSettingsPanel>
							</div>
						</div>
					</div>
					</div>
				</StyledSideBarEditor>
				<StyledSideBarDocuments>
					<div id="documents-ui" >
						<StyledDocumentsView selectedEditor={this.state.selectedEditor}>
							<DocumentsView  ref={(c) => this.documentsViewRef = c}  editorCtrl={this.state.editorCtrl} projectID={this.state.project.getId()} projectType={this.state.project.getType()} report={this.report}/>
						</StyledDocumentsView>
					</div>
				</StyledSideBarDocuments>
				<StyledSideBarCodesystem>
						<Codesystem
							ref={(c) => {if (c) this.codesystemViewRef = c.child;}}
							codingViewIsVisible ={this.state.showCodingView}
							pageView = {this.state.selectedEditor}
							umlEditor = {this.umlEditorRef}
							projectID={this.state.project.getId()}
							projectType={this.state.project.getType()}
							account={this.props.account}
							codesystemId={this.state.project.getCodesystemID()}
							toggleCodingView={this.toggleCodingView}
							editorCtrl={this.state.editorCtrl}
							umlEditorEnabled={this.state.project.isUmlEditorEnabled()}
							showFooter={this.showCodingView}
							selectionChanged={this.selectionChanged}
							insertCode={this.insertCode}
							removeCode={this.removeCode}
							documentsView = {this.documentsViewRef}
						 />
				</StyledSideBarCodesystem>
			</StyledSideBar>
			<StyledEditor>

				<div id="textdocument-ui">
					<StyledTextEditorMenu selectedEditor={this.state.selectedEditor} >


						<a id="btnTxtSave" className="btn btn-default btn-default" >
							<i className="fa fa-floppy-o "></i>
							Save
						</a>

						<div className="btn-group ui-widget">
							<a id="btnTxtBold" className="btn btn-default" >
								<i className="fa fa-bold fa-1x"></i>
							</a>
							<a id="btnTxtItalic" className="btn btn-default">
								<i className="fa fa-italic fa-1x"></i>
							</a>
							<a id="btnTxtUnderline" className="btn btn-default">
								<i className="fa fa-underline fa-1x"></i>
							</a>
							<label>&nbsp;&nbsp;Font: </label> <select id="combobox">
								<option value="">Select one...</option>
								<option value="Arial">Arial</option>
								<option value="Arial Black">Arial Black</option>
								<option value="Comic Sans MS">Comic Sans MS</option>
								<option value="Courier New">Courier New</option>
								<option value="Georgia">Georgia</option>
								<option value="Impact">Impact</option>
								<option value="Lucida Console">Lucida Console</option>
								<option value="Palatino Linotype">Palatino Linotype</option>
								<option value="Tahoma">Tahoma</option>
								<option value="Times New Roman">Times New Roman</option>
								<option value="Trebuchet MS">Trebuchet MS</option>
								<option value="Verdana">Verdana</option>
							</select>

						</div>
						<label >Font Size: </label>
						<input id="txtSizeSpinner"  />

					</StyledTextEditorMenu>
						<TextEditor initEditorCtrl={this.initEditorCtrl} selectedEditor={this.state.selectedEditor} showCodingView={this.state.showCodingView}/>
					<StyledUMLEditor selectedEditor={this.state.selectedEditor} showCodingView={this.state.showCodingView} id="editor" >
						{this.renderUMLEditor()}
					</StyledUMLEditor>
				</div>

			</StyledEditor>
			<StyledFooter  showCodingView={this.state.showCodingView}>
				<CodeView
					ref={(c) => {if (c) this.codeViewRef = c;}}
					code={this.state.selectedCode}
					editorCtrl={this.state.editorCtrl}
					documentsView={this.documentsViewRef}
					updateSelectedCode={this.updateSelectedCode}
					getCodeById={this.getCodeById}
					getCodeByCodeID={this.getCodeByCodeID}
					getCodeSystem={this.getCodeSystem}
					createCode={this.createCode}
					selectCode={this.selectCode}
					hideCodingView={this.hideCodingView}/>
			</StyledFooter>
		</StyledCodingEditor>
		);
	}
}