//@ts-check
import React, {Component} from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

const StyledPanel = styled.div`
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

const StyledUserName = styled.div`
	font-size: 15px;
	margin-top: 20px;
`;

const StyledUserEmail = styled.div`
	font-size: 12px;
	font-style: italic;
	margin-bottom: 7px;
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

	onChangeNameAndEmail() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const emailLabel = formatMessage({
			id: 'settings.profile.change.email',
			defaultMessage: 'Email'
		});
		const firstNameLabel = formatMessage({
			id: 'settings.profile.change.firstname',
			defaultMessage: 'First Name'
		});const lastNameLabel = formatMessage({
			id: 'settings.profile.change.lastname',
			defaultMessage: 'Last Name'
		});

		vex.dialog.open({
			message: formatMessage({
				id: 'settings.profile.change.dialog',
				defaultMessage: 'Change your profile information'
			}),
			input: [
				`<label for="emailInput">${emailLabel}</label><input name="emailInput" value=${_this.props.auth.userProfile.email} type="text" required />`,
				`<label for="firstnameInput">${firstNameLabel}</label><input name="firstnameInput" value=${_this.props.auth.userProfile.firstname} type="text" required />`,
				`<label for="lastnameInput">${lastNameLabel}</label><input name="lastnameInput" value=${_this.props.auth.userProfile.lastname} type="text" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'settings.profile.change.confirm',
						defaultMessage: 'Save'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'settings.profile.change.cancel',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: async function(data) {
				if (data === false) {
					return console.log('Cancelled');
				}

				_this.changeNameAndEmail({
					email: data.emailInput,
					firstname: data.firstnameInput,
					lastname: data.lastnameInput
				});
			}
		});
	}

	changeNameAndEmail(data) {
		console.log(data);
	}


	render() {
		return (
			<div>
				<StyledPanel>
					<img width='100px' height='100px' src={this.props.auth.userProfile.picSrc} alt='profile img'/>
					<StyledUserName>{this.props.auth.userProfile.name}</StyledUserName>
					<StyledUserEmail>{this.props.auth.userProfile.email}</StyledUserEmail>
					<button onClick={() => this.onChangeNameAndEmail()} className="btn btn-primary btn-xs">
						<i className="fa fa-pencil"/>
					</button>
				</StyledPanel>
				<StyledPanel>
					<StyledDeleteAccountLabel>
						<FormattedMessage
							id="settings.profile.delete.description"
							defaultMessage="Delete your QDAcity-Account"
						/>	
					</StyledDeleteAccountLabel>
					<StyledDeleteAccountButton id='profile-settings-delete-button' className="btn btn-danger btn-md" onClick={() => this.onDeleteUser()}>
						<i className="fa fa-trash"/>
						<FormattedMessage
							id="settings.profile.delete.button"
							defaultMessage=" Delete"
						/>	
					</StyledDeleteAccountButton>
				</StyledPanel>
			</div>
		);
	}
}