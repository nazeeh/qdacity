import React from 'react';

export default class SettingsBtn extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToCodingEditor = this.redirectToCodingEditor.bind(this);
	}

	getStyles() {
		return {
			settingsBtn: {
				marginLeft: "5px"
			}
		};
	}

	redirectToCodingEditor() {
		location.href = 'coding-editor.html?project=' + this.props.projectId + '&type=' + this.props.projectType;
	}

	render() {
		if (this.props.isProjectOwner || this.props.isValidationCoder) {
			const styles = this.getStyles();

			return (
				<button 
					type="button" 
					className="btn btn-default btn-sm pull-right"
					style={styles.settingsBtn}
					onClick={this.redirectToCodingEditor}
				>
					<i className="fa fa-tags fa-lg"></i>&nbsp;&nbsp;<b>Coding Editor</b>
				</button>
			);
		} else {
			return null;
		}

	}
}