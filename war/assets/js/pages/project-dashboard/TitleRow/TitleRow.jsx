import React from 'react';

import Settings from '../../../common/modals/Settings';
import SettingsBtn from "./SettingsBtn.jsx"
import CodingEditorBtn from "./CodingEditorBtn.jsx"

export default class TitleRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isValidationCoder: false,
			prjName: "",
			prjSettings: {}
		};
	}

	getStyles() {
		return {
			projectName: {
				marginLeft: "5px"
			}
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
		const styles = this.getStyles();
		var projectName = (this.props.project.name ? this.props.project.name : "")
		return (
			<h2 className="page-header">
			<i className="fa fa-newspaper-o"></i>
				<span style={styles.projectName}>
					{projectName}
				</span>

				<SettingsBtn project={this.props.project} isProjectOwner={this.props.isProjectOwner} />
				<CodingEditorBtn project={this.props.project} isProjectOwner={this.props.isProjectOwner}  isValidationCoder={this.props.isValidationCoder} />
          </h2>
		);
	}


}
