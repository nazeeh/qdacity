import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import CourseEndPoint from '../../../common/endpoints/CourseEndpoint';

import { ListMenu } from '../../../common/styles/ItemList.jsx';

import { StyledSearchField } from '../../../common/styles/SearchBox.jsx';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

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
		console.log(this.props.termCourse);
		CourseEndPoint.inviteUserTermCourse(
			this.props.termCourse.id,
			this.state.userEmail
		)
			.then(function() {
				alertify.success(
					formatMessage(
						{
							id: 'inviteuserfield.invite_success',
							defaultMessage: '{email} has been invited'
						},
						{ email: _this.state.userEmail }
					)
				);
			})
			.catch(function() {
				alertify.error(
					formatMessage(
						{
							id: 'inviteuserfield.invite_not_found',
							defaultMessage: '{email} was not found'
						},
						{ email: _this.state.userEmail }
					)
				);
			});
	}

	render() {
		const { formatMessage } = IntlProvider.intl;
		const searchFieldPlaceholder = formatMessage({
			id: 'inviteuserfield.user_email',
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
