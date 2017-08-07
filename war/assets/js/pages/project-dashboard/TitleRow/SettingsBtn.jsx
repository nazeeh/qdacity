import React from 'react';
import styled from 'styled-components';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import Settings from '../../../common/modals/Settings';

const StyledSettingsBtn = styled.button `
	margin-left: 5px;
	& > i {
    	padding-right: 5px;
  }
`;

export default class SettingsBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isProjectOwner: false,
			umlEditor: this.props.umlEditor
		};
		this.showSettingsModal = this.showSettingsModal.bind(this);
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

		return (
			<StyledSettingsBtn
				type="button"
				className="btn btn-default btn-sm pull-right"
				onClick={this.showSettingsModal}
			>
				<i className="fa fa-cog fa-lg"></i><span><b>Settings</b></span>
			</StyledSettingsBtn>
		);
	}


}