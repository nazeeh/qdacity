import React from 'react';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import Settings from '../../../common/modals/Settings';


export default class SettingsBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isProjectOwner: false,
			umlEditor: this.props.umlEditor
		};
		this.showSettingsModal = this.showSettingsModal.bind(this);
	}

	getStyles() {
		return {
			settingsBtn: {
				marginLeft: "5px"
			}
		};
	}

	setUmlEditor(pUseUmlEditor) {
		this.state = {
			umlEditor: pUseUmlEditor
		};
	}

	setIsProjectOwner(pIsProjectOnwer) {
		this.setState({
			isProjectOwner: pIsProjectOnwer
		});
	}

	showSettingsModal() {
		var modal = new Settings();
		var _this = this;
		modal.showModal(this.state.umlEditor).then(function (data) {
			ProjectEndpoint.setUmlEditorEnabled(_this.props.project.getId(), _this.props.project.getType(), data.umlEditorEnabled).then(function (resp) {
				_this.setState({
					umlEditor: data.umlEditorEnabled
				});
			});
		});
	}

	render() {
		if (!this.props.isProjectOwner) return null;

		const styles = this.getStyles();

		return (
			<button 
				type="button" 
				className="btn btn-default btn-sm pull-right"
				style={styles.settingsBtn}
				onClick={this.showSettingsModal}
			>
				<i className="fa fa-cog fa-lg"></i>&nbsp;&nbsp;<b>Settings</b>
			</button>
		);
	}


}