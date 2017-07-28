import React from 'react'
import styled from 'styled-components';

import UmlEditor from '../uml-editor/UmlEditor.jsx';
import DocumentsView from './Documents/DocumentsView.jsx';
import Codesystem from './Codesystem/Codesystem.jsx';
import CodeView from './CodeView/CodeView.jsx';
import PageViewChooser from './View/PageViewChooser.jsx';
import ProjectDashboardBtn from './ProjectDashboardBtn.jsx';

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
		"sidebar editor"
		"footer footer";
`;

const StyledPanelHeader = styled.div `
	text-align: center;
	position:relative;
	background-color: #e7e7e7;
 `;

const StyledSettingsPanel = styled.div `
	background-color: #f8f8f8;
`;

const StyledEditableToggle = styled.a `
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
	color: #000;
`;


const StyledSideBar = styled.div `
	grid-area: sidebar;
`;

const StyledEditor = styled.div `
	grid-area: editor;
`;

const StyledFooter = styled.div `
	grid-area: footer;
	display: ${props => props.showCodingView ? 'block' : 'none'} !important;
	z-index: 1;
`;

const StyledTextEditor = styled.iframe `
	height: ${props => props.showCodingView ? 'calc(100vh - 350px)' : 'calc(100vh - 51px)'} !important;
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
`;

const StyledUMLEditor = styled.div `
	height: ${props => props.showCodingView ? 'calc(100vh - 350px)' : 'calc(100vh - 51px)'} !important;
	display: ${props => (props.selectedEditor === PageView.UML) ? 'block' : 'none'} !important;
`;

const StyledDocumentsView = styled.div `
	display: ${props => (props.selectedEditor === PageView.TEXT) ? 'block' : 'none'} !important;
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
			selectedEditor: PageView.TEXT

		};
		const _this = this;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
			project.setCodesystemID(resp.codesystemID);
			project.setUmlEditorEnabled(resp.umlEditorEnabled);
			_this.setState({
				project: project
			});
		});

		this.toggleCodingView = this.toggleCodingView.bind(this);
		this.hideCodingView = this.hideCodingView.bind(this);
		this.selectionChanged = this.selectionChanged.bind(this);
		this.updateSelectedCode = this.updateSelectedCode.bind(this);
		this.viewChanged = this.viewChanged.bind(this);
		this.getCodeSystem = this.getCodeSystem.bind(this);
		this.getCodeByCodeID = this.getCodeByCodeID.bind(this);
		this.showCodingView = this.showCodingView.bind(this);
	}


	componentDidMount() {
		this.setState({
			editorCtrl: new EditorCtrl(this.getCodeByCodeID)
		});
	}

	viewChanged(view) {
		this.setState({
			selectedEditor: view
		});
	}

	getCodeByCodeID(codeID) {
		return this.codesystemViewRef.getCodeByCodeID(codeID);
	}

	toggleCodingView() {
		this.setState({
			showCodingView: !this.state.showCodingView
		});
	}

	selectionChanged(newCode) {
		this.setState({
			selectedCode: newCode
		});
	}

	insertCode() {

	}

	removeCode() {

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

	render() {
		return (
		<StyledCodingEditor height={$(window).height()} showCodingView={this.state.showCodingView} >
			<StyledSideBar>
				<div id="pageViewChooser-ui"></div>

				<div className="row no-gutters" >
				<div id="project-ui" >
					<div >

						<div >
							<ProjectDashboardBtn project={this.state.project}/>
							<div id="agreementMapSettings" className="hidden">
								<p>
								  <span>Showing False Negatives >= </span>
								  <span id="maxFalseNeg" className="falseNegValue"></span>
								</p>
								<div id="agreementMapSlider" className="agreementMapSlider"></div>
							</div>

							<div className="row no-gutters" >
							<StyledSettingsPanel>
							<StyledPanelHeader>
								<b>Editor</b>
							</StyledPanelHeader>
							<PageViewChooser viewChanged={this.viewChanged} />
							<div >


								<StyledEditableToggle selectedEditor={this.state.selectedEditor} id="btnEditToggle" className="btn btn-sm edit-toggle collapsed" data-toggle="collapse" data-target="#textdocument-menu">
									<span className="edit-toggle-off">
										<i className="fa fa-toggle-off fa-2x"></i>
									</span>
									<span className="edit-toggle-on">
										<i className="fa fa-toggle-on fa-2x"></i>
									</span>
									<span > Document Editable</span>
								</StyledEditableToggle>


							</div>
							</StyledSettingsPanel>
						</div>
					</div>
				</div>
				</div>
				</div>
				<div id="documents-ui" >
					<StyledDocumentsView selectedEditor={this.state.selectedEditor}>
						<DocumentsView  ref={(c) => this.documentsViewRef = c}  editorCtrl={this.state.editorCtrl} projectID={this.state.project.getId()} projectType={this.state.project.getType()} report={this.report}/>
					</StyledDocumentsView>
				</div>

				<div id="codesystem-ui" >
					<Codesystem
						ref={(c) => {if (c) this.codesystemViewRef = c.child;}}
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
				</div>
			</StyledSideBar>
			<StyledEditor>

				<div id="textdocument-ui">
					<div id="textdocument-menu" className="collapse" aria-expanded="false" >


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

					</div>
					<StyledTextEditor selectedEditor={this.state.selectedEditor} showCodingView={this.state.showCodingView} id="editor" >
					</StyledTextEditor>
					<StyledUMLEditor selectedEditor={this.state.selectedEditor} showCodingView={this.state.showCodingView} id="editor" >
						<UmlEditor ref={(c) => {if (c) this.umlEditorRef = c;}} codesystemId={this.state.project.getCodesystemID()} codesystemView={this.codesystemViewRef} updateCode={this.updateSelectedCode} refreshCodeView={this.codeViewRef.updateCode} />
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
					getCodeByCodeID={this.getCodeByCodeID}
					getCodeSystem={this.getCodeSystem}
					hideCodingView={this.hideCodingView}/>
			</StyledFooter>

		</StyledCodingEditor>
		);
	}
}