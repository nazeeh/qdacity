//@ts-check
import React from 'react';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import styled from 'styled-components';
import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js'

export default class UserGroupList extends React.Component {
	constructor(props) {
        super(props);

        this.itemList = null;

        this.init();
        
        this.renderUserGroup = this.renderUserGroup.bind(this);
    }

    init() {
		const _this = this;
        
        UserGroupEndpoint.listUserGroups().then(function(resp) {
            const userGroupList = resp.items || [];
            _this.sortUserGroups(userGroupList);
            _this.props.setUserGroups(userGroupList);
        })
    }
    
    sortUserGroups(userGroups) {
        userGroups.sort(function(a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        return userGroups;
    }

    isOwnedUserGroup(userGroup) {
        return userGroup.owners.includes(this.props.auth.userProfile.qdacityId)
    }

    userGroupClick(group) {
        this.props.history.push(
			'/GroupDashboard?userGroup=' + group.id
		);
    }

    renderUserGroup(userGroup, index) {
		if (this.isOwnedUserGroup(userGroup)) {
			return (
				<StyledListItemDefault
					key={userGroup.id}
					onClick={this.userGroupClick.bind(this, userGroup)}
				>
                {userGroup.name}
				</StyledListItemDefault>
			);
		} else {
			return (
				<StyledListItemPrimary
					key={userGroup.id}
					onClick={this.userGroupClick.bind(this, userGroup)}
				>
                {userGroup.name}
				</StyledListItemPrimary>
			);
		}
	}


    render() {
        return (
			<div>
				<ListMenu>
					{this.itemList ? this.itemList.renderSearchBox() : ''}
				</ListMenu>

				<ItemList
					ref={r => {
						if (r) this.itemList = r;
					}}
					hasSearch={true}
					hasPagination={true}
					doNotrenderSearch={true}
					itemsPerPage={8}
					items={this.props.userGroups}
					renderItem={this.renderUserGroup}
				/>
			</div>
		);
    }
}