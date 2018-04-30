//@ts-check
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import { ThemeProvider } from 'styled-components';
import Theme from '../../common/styles/Theme.js';
import { BtnDefault } from '../../common/styles/Btn.jsx';

import styled from 'styled-components';

import ImageChooser from './ImageChooser.jsx';
import UserEndpoint from '../../common/endpoints/UserEndpoint.js';


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

const StyledProfileImgWrapper = styled.div`
	width: 150px;
	display: block;
	margin-left: auto;
	margin-right: auto;
	position:relative;
	
	&:hover {
		& > div {
			display: inherit;
		}
	}
`;

const StyledChangeImgButtonWrapper = styled.div`
	opacity: 0.7;
	display: none;

	& > button {
		position: absolute;
		top: 3px;
		right: 3px;
	}
`;


export default class ProfileSettings extends Component {
	constructor(props) {
		super(props);

		this.changeProfileImg = this.changeProfileImg.bind(this);
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

	async deleteUser() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		let resultMessage = '';
		try {
			const resp = await UserEndpoint.removeUser(this.props.auth.userProfile.qdacityId)
			resultMessage = formatMessage({
				id: 'settings.profile.delete.success',
				defaultMessage: 'Your accunt was successfully deleted.'
			});
		} catch (e) {
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

				_this.updateUserData({
					email: data.emailInput,
					givenName: data.firstnameInput,
					surName: data.lastnameInput
				});
			}
		});
	}

	updateUserData(data) {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		data.userId = _this.props.auth.userProfile.qdacityId;

		UserEndpoint.updateUserProfile(data).then(async function(resp) {
			if(!resp.code) {
				console.log('changed user data');
			} else {
				vex.dialog.open({
					message: formatMessage({
						id: 'settings.profile.update.failure.heading',
						defaultMessage: 'Could not update the user profile.'
					}),
					buttons: [
						$.extend({}, vex.dialog.buttons.NO, {
							text: formatMessage({
								id: 'settings.profile.update.failure.ok',
								defaultMessage: 'OK'
							})
						})
					]
				});
			}
			await _this.props.auth.authentication.refreshSession();
		})
	}

	onChangeProfileImg() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const formElements = '<div id="upload-img-placeholder">';

		vex.dialog.open({
			message: '',
			input: formElements,
			buttons: [
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'settings.profile.change.picture.cancel',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: async function(data) {
				if (data === false) {
					return console.log('Cancelled');
				} else {
					// callback triggered by ImageChooser component.
				}
			}
		});
		ReactDOM.render(
			<IntlProvider>
				<ThemeProvider theme={Theme}>
					<ImageChooser onSave={_this.changeProfileImg} initialImg={_this.props.auth.userProfile.picSrc}/>
				</ThemeProvider>
			</IntlProvider>,
			document.getElementById('upload-img-placeholder')
		);
	}

	changeProfileImg(imgBase64) {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const imgBase64WithoutMetaInformation = imgBase64.split(',')[1];
		const data = {
			blob: imgBase64WithoutMetaInformation
		}

		UserEndpoint.updateProfileImg(data).then(async function(resp) {
			if(!resp.code) {
				console.log('changed user profile picture');
			} else {
				vex.dialog.open({
					message: formatMessage({
						id: 'settings.profile.update.failure.heading',
						defaultMessage: 'Could not update the user profile.'
					}),
					buttons: [
						$.extend({}, vex.dialog.buttons.NO, {
							text: formatMessage({
								id: 'settings.profile.update.failure.ok',
								defaultMessage: 'OK'
							})
						})
					]
				});
			}
			await _this.props.auth.authentication.refreshSession();
		})
	}

	render() {
		return (
			<div>
				<StyledPanel>
					<StyledProfileImgWrapper>
						<img width='150px' height='150px' src={this.props.auth.userProfile.picSrc} alt='profile img'/>
						<StyledChangeImgButtonWrapper>
							<BtnDefault onClick={() => this.onChangeProfileImg()}>
								<i className="fa fa-pencil"/>
							</BtnDefault>
						</StyledChangeImgButtonWrapper>
					</StyledProfileImgWrapper>
					<StyledUserName>{this.props.auth.userProfile.name}</StyledUserName>
					<StyledUserEmail>{this.props.auth.userProfile.email}</StyledUserEmail>
					<BtnDefault onClick={() => this.onChangeNameAndEmail()}>
						<i className="fa fa-pencil"/>
					</BtnDefault>
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