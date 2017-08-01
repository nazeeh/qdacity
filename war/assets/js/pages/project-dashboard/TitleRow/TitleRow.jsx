import React from 'react';
import styled from 'styled-components';

import Settings from '../../../common/modals/Settings';
import SettingsBtn from "./SettingsBtn.jsx"
import CodingEditorBtn from "./CodingEditorBtn.jsx"

const StyledProjectName = styled.span `
	margin-left: 5px;
`;

export default class TitleRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isValidationCoder: false,
			prjName: "",
			prjSettings: {}
		};
	}

	setSettings(properties) {
		var settings = {
			umlEditor: properties.umlEditorEnabled
		};

		this.setState({
			prjSettings: settings
		});
	}


	render() {
		var projectName = (this.props.project.name ? this.props.project.name : "")
		return (
			<h2 className="page-header">
			<i className="fa fa-newspaper-o"></i>
				<StyledProjectName>
					{projectName}
				</StyledProjectName>

				<SettingsBtn project={this.props.project} isProjectOwner={this.props.isProjectOwner} />
				<CodingEditorBtn project={this.props.project} isProjectOwner={this.props.isProjectOwner}  isValidationCoder={this.props.isValidationCoder} history={this.props.history}/>
          </h2>
		);
	}


}