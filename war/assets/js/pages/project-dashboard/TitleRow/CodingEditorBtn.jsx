import React from 'react';
import styled from 'styled-components';

const StyledSettingsBtn = styled.button `
	margin-left: 5px;
	& > i {
    	padding-right: 5px;
  	}
`;

export default class SettingsBtn extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToCodingEditor = this.redirectToCodingEditor.bind(this);
	}

	redirectToCodingEditor() {
		this.props.history.push('/CodingEditor?project=' + this.props.project.getId() + '&type=' + this.props.project.getType());
	}

	render() {
		if (this.props.isProjectOwner || this.props.isValidationCoder) {
			return (
				<StyledSettingsBtn
					type="button"
					className="btn btn-default btn-sm pull-right"
					onClick={this.redirectToCodingEditor}
				>
					<i className="fa fa-tags fa-lg"></i><b>Coding Editor</b>
				</StyledSettingsBtn>
			);
		} else {
			return null;
		}

	}
}