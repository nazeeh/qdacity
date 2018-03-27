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
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const deleteLabel = formatMessage({
			id: 'settings.profile.delete.inputLabel',
			defaultMessage: 'Type'
		});

		vex.dialog.open({
			message: formatMessage({
				id: 'settings.profile.delete.dialog',
				defaultMessage: 'Are you sure about deleting your QDAcity account?'
			}),
			input: [
				`<label for="deleteInput">${deleteLabel + ' DELETE'}</label><input name="deleteInput" type="text" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'settings.profile.delete.confirm',
						defaultMessage: 'Delete'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'settings.profile.delete.cancel',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: async function(data) {
				if (data === false) {
					return console.log('Cancelled');
				}

				if (data.deleteInput !== 'DELETE') {
					vex.dialog.open({
						message: formatMessage({
							id: 'settings.profile.delete.wrongInput',
							defaultMessage: 'The input was not correct. Aborting the deletion process!'
						}),
						buttons: [
							$.extend({}, vex.dialog.buttons.NO, {
								text: formatMessage({
									id: 'settings.profile.delete.ok',
									defaultMessage: 'OK'
								})
							})
						]
					});
				} else {
					_this.deleteUser();
				}
			}
		});
	}

	deleteUser() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		gapi.client.qdacity.user.removeUser({
			id: this.props.auth.userProfile.qdacityId
		}).execute(function(resp) {
			let resultMessage = '';
			if (!resp.code) {
				resultMessage = formatMessage({
					id: 'settings.profile.delete.success',
					defaultMessage: 'Your accunt was successfully deleted.'
				});
			} else {
				resultMessage = formatMessage({
					id: 'settings.profile.delete.failure',
					defaultMessage: 'Oops, something went wrong while deleting your account...'
				});
			}

			vex.dialog.open({
				message: resultMessage,
				buttons: [
					$.extend({}, vex.dialog.buttons.NO, {
						text: formatMessage({
							id: 'settings.profile.delete.ok',
							defaultMessage: 'OK'
						})
					})
				],
				callback: function() {
					_this.props.auth.authentication.signOut();
					_this.props.history.push('/');
					location.reload();
				}
			});
		});
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