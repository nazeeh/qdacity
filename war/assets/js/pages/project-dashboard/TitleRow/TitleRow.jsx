import React from 'react';

import Settings from '../../../common/modals/Settings';
import SettingsBtn from "./SettingsBtn.jsx"
import CodingEditorBtn from "./CodingEditorBtn.jsx"

export default class TitleRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isProjectOwner: false,
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

	setIsValidationCoder(properties) {
		var account = this.props.account;
		account.getCurrentUser().then((user) => {
			var isValidationCoder = account.isValidationCoder(user, properties);
			this.setState({
				isValidationCoder: isValidationCoder
			});
		});

	}

	setProjectProperties(properties) {
		this.setSettings(properties);
		this.setIsValidationCoder(properties);
		this.setState({
			prjName: properties.name
		});
	}

	setIsProjectOwner(pIsProjectOnwer) {
		this.setState({
			isProjectOwner: pIsProjectOnwer
		});
	}

	render() {
		const styles = this.getStyles();

		return (
			<h2 className="page-header">
			<i className="fa fa-newspaper-o"></i> 
				<span style={styles.projectName}>
					{this.state.prjName}
				</span>
				
				<SettingsBtn projectType={this.props.projectType} projectId={this.props.projectId} isProjectOwner={this.state.isProjectOwner} />
				<CodingEditorBtn projectType={this.props.projectType} projectId={this.props.projectId} isProjectOwner={this.state.isProjectOwner}  isValidationCoder={this.state.isValidationCoder} />	            
          </h2>
		);
	}


}