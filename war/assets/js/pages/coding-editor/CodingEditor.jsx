import React from 'react'
import styled from 'styled-components';

import DocumentsView from './Documents/DocumentsView.jsx';
import Codesystem from './Codesystem/Codesystem.jsx';
import CodeView from './CodeView/CodeView.jsx';


import EditorCtrl from './EditorCtrl';
import Project from '../project-dashboard/Project';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';


const StyledCodingEditor = styled.div `
	padding-top: 51px;
	display: grid;
	grid-template-columns: 3fr 15fr;
	grid-template-rows:	1fr	300px;
	grid-template-areas:
		"sidebar editor"
		"footer footer";
`;

const StyledSideBar = styled.div `
	grid-area: sidebar;
`;

const StyledEditor = styled.div `
	grid-area: editor;
	height: calc(100vh - 300px );

`;

const StyledFooter = styled.div `
	grid-area: footer
`;

const StyledTextEditor = styled.iframe `
	height: 80vh;
	height: ${props => "calc(100vh - 300px)"} !important;
	showCodingView
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
		this.state = {
			project: project,
			editorCtrl: {},
			showCodingView: true
		};
		const _this = this;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
			project.setCodesystemID(resp.codesystemID);
			project.setUmlEditorEnabled(resp.umlEditorEnabled);
			_this.setState({
				project: project
			});
		});

		//this.calculateCodingCount = this.calculateCodingCount.bind(this);
	}

	componentDidMount() {
		this.setState({
			editorCtrl: new EditorCtrl(this.getCodeByCodeID)
		});
	}

	getCodeByCodeID(codeID) {
		//return codesystemView.getCodeByCodeID(codeID);
	}

	toggleCodingView() {
		// if ($("#footer").is(":visible")) {
		// 	hideCodingView();
		// } else {
		// 	showCodingView();
		// }
	}

	showFooter() {
		//$("#footer").show("clip", {}, 200, resizeElements);
	}

	selectionChanged() {

	}

	insertCode() {

	}

	removeCode() {

	}

	getCodeSystem() {
		//return codesystemView.getCodesystem();
	}

	hideCodingView() {
		//$("#footer").hide("clip", {}, 200, resizeElements);

	}


	updateSelectedCode(code, persist) {
		codesystemView.updateSelected(code, persist);
		umlEditor.codeUpdated(code);
	}

	render() {
		return (
		<StyledCodingEditor height={$(window).height()}>
			<StyledSideBar>
				<div id="pageViewChooser-ui"></div>

				<div className="row no-gutters" >
				<div id="project-ui" >
					<div >

						<div >
							<div className="list-group">
								<a className="list-group-item projectDashboardLink clickable">
									<i className="fa fa-home fa-fw "></i>
									Project Dashboard
								</a>
							</div>
							<div id="agreementMapSettings" className="hidden">
								<p>
								  <span>Showing False Negatives >= </span>
								  <span id="maxFalseNeg" className="falseNegValue"></span>
								</p>
								<div id="agreementMapSlider" className="agreementMapSlider"></div>
							</div>

							<div className="row no-gutters" >
							<div id="settings" className="collapse">
							<div>
								<b>Settings</b>
							</div>
							<div >


								<a id="btnEditToggle" className="btn btn-sm edit-toggle collapsed" data-toggle="collapse" data-target="#textdocument-menu">
									<span className="edit-toggle-off">
										<i className="fa fa-toggle-off fa-2x"></i>
									</span>
									<span className="edit-toggle-on">
										<i className="fa fa-toggle-on fa-2x"></i>
									</span>
									<span > Document Editable</span>
								</a>


							</div>
							</div>
						</div>
					</div>
				</div>
				</div>
				</div>
				<div id="documents-ui" >
					<div id="document-section" >
						<DocumentsView  ref={(c) => this.documentsViewRef = c}  editorCtrl={this.state.editorCtrl} projectID={this.state.project.getId()} projectType={this.state.project.getType()} report={this.report}/>
					</div>
				</div>

				<div id="codesystem-ui" >
					<Codesystem
						projectID={this.state.project.getId()}
						projectType={this.state.project.getType()}
						account={this.props.account}
						codesystemId={this.state.project.getCodesystemID()}
						toggleCodingView={this.toggleCodingView}
						editorCtrl={this.state.editorCtrl}
						umlEditorEnabled={this.state.project.isUmlEditorEnabled()}
						showFooter={this.showFooter}
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
					<StyledTextEditor showCodingView={this.state.showCodingView} id="editor" >
					</StyledTextEditor>

					<div id="umlEditorContainer"></div>
				</div>

			</StyledEditor>
			<StyledFooter>
				<CodeView
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