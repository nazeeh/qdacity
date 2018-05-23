//@ts-check
import React from 'react';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import styled from 'styled-components';

import CustomForm from '../../common/modals/CustomForm';
import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';


const StyledPageHeader = styled.div`
	grid-area: header;

	padding-left: 20px;
`;

const StyledUserGroupName = styled.span`
	margin-left: 5px;
`;

export default class GroupTitleRow extends React.Component {
	constructor(props) {
		super(props);

		this.showChangeNameModal = this.showChangeNameModal.bind(this);
	}

	showChangeNameModal() {
		const { formatMessage } = IntlProvider.intl;
		const _this = this;
		const modal = new CustomForm(
			formatMessage({
				id: 'group.change_name',
				defaultMessage: 'Change the name of the group'
			}
		));
		modal.addTextInput(
			'groupName',
			formatMessage({
				id: 'group.name',
				defaultMessage: 'Group Name'
			}),
			_this.props.userGroup.name,
			_this.props.userGroup.name
		);
		modal.showModal().then(function(data) {
			UserGroupEndpoint.updateName(
				_this.props.userGroup.id,
				data.groupName
			).then(function(resp) {
				_this.props.nameChanged(resp.name);
				_this.forceUpdate();
			});
		});
	}

	renderEditBtn() {
		if (!this.props.isOwner) return '';
		else
			return (
				<div className="box-tools pull-right">
					<button
						type="button"
						className="btn btn-box-tool"
						onClick={this.showChangeNameModal}
					>
						<i className="fa fa-pencil fa-lg  hoverHand" />
					</button>
				</div>
			);
	}

	render() {
		return (
			<StyledPageHeader className="page-header">
				<i className="fa fa-users" />
				<StyledUserGroupName>{this.props.userGroup.name}</StyledUserGroupName>
				{this.renderEditBtn()}
			</StyledPageHeader>
		);
	}
}
