import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import CourseEndPoint from '../../../common/endpoints/CourseEndpoint';

import { BtnDefault } from '../../../common/styles/Btn.jsx';
import { ListMenu } from '../../../common/styles/ItemList.jsx';

import { StyledSearchField } from '../../../common/styles/SearchBox.jsx';

export default class InviteUserField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userEmail: ''
		};
		this.updateUserEmail = this.updateUserEmail.bind(this);
		this.inviteUser = this.inviteUser.bind(this);
	}

	updateUserEmail(e) {
		this.setState({
			userEmail: e.target.value
		});
	}

	inviteUser() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		CourseEndPoint.inviteUser(this.props.course.getId(), this.state.userEmail)
			.then(function(resp) {
				alertify.success(
					formatMessage(
						{
							id: 'inviteuserfield.invited',
							defaultMessage: '{email} has been invited'
						},
						{
							email: _this.state.userEmail
						}
					)
				);
			})
			.catch(function(resp) {
				alertify.error(
					formatMessage(
						{
							id: 'inviteuserfield.invited',
							defaultMessage: '{email} was not found'
						},
						{
							email: _this.state.userEmail
						}
					)
				);
			});
	}

	render() {
		const { formatMessage } = IntlProvider.intl;
		const _this = this;
		const searchFieldPlaceholder = formatMessage({
			id: 'inviteuserfield.search',
			defaultMessage: 'User Email'
		});

		return (
			<ListMenu>
				<StyledSearchField
					type="text"
					className="searchfield"
					placeholder={searchFieldPlaceholder}
					value={this.state.userEmail}
					onChange={this.updateUserEmail}
					onKeyPress={e => {
						if (e.key === 'Enter') this.inviteUser();
					}}
				/>
				<BtnDefault type="button" onClick={this.inviteUser}>
					<i className="fa fa-paper-plane  fa-lg" /> Invite
				</BtnDefault>
			</ListMenu>
		);
	}
}
