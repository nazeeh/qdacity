//@ts-check
import React, {Component} from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

const StyledDeleteAccountPanel = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
	margin: 20px;
	text-align: center;
`;

const StyledDeleteAccountLabel = styled.p`
	display: inline-block;
	font-size: 16px;
`;

const StyledDeleteAccountButton = styled.button`
	margin-left: 80px;
`;


export default class ProfileSettings extends Component {
	constructor(props) {
		super(props);
	}

	onDeleteUser() {
		console.log('User delete');
	}


	render() {
		return (
			<StyledDeleteAccountPanel>
				<StyledDeleteAccountLabel>
					<FormattedMessage
						id="settings.profile.delete.description"
						defaultMessage="Delete your QDAcity-Account"
					/>	
				</StyledDeleteAccountLabel>
				<StyledDeleteAccountButton className="btn btn-danger btn-md" onClick={() => this.onDeleteUser()}>
					<i className="fa fa-trash"/>
					<FormattedMessage
						id="settings.profile.delete.button"
						defaultMessage=" Delete"
					/>	
				</StyledDeleteAccountButton>
			</StyledDeleteAccountPanel>
		);
	}
}