//@ts-check
import React, {Component} from 'react';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';



const StyledPanel = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
    margin: 20px;
`;

const StyledUserGroupList = styled.ul`
    padding-left: 5px;
    margin-top: 30px;
    list-style: none;
`;

const StyledUserGroupItem = styled.li`
    padding: 3px 5px;
    margin-bottom: 5px;

    background-color: ${props => props.theme.bgDefault};
    border: 1px solid ${props => props.theme.borderPrimary};

    &:hover {
        border-color ${props => props.theme.borderDefault};
    }
    &:active {
        border-color ${props => props.theme.borderDefault};
    }
    &:focus {
        border-color ${props => props.theme.borderDefault};
    }
`;

export default class UserGroupSettings extends Component {
	constructor(props) {
        super(props);
        
        this.state = {
            userGroups: []
        }
        this.updateUserGroups();
    }

    updateUserGroups() {
        const _this = this;

        UserGroupEndpoint.listOwnedUserGroups()
            .then(function(resp) {
                _this.setState({
                    userGroups: resp.items || []
                });
            })
            .catch(function(e) {
                console.error(e);
                _this.setState({
                    userGroups: []
                });
            })
    }
    
    render() {

        const UserGroupListItems = ({ userGroups }) => {
            return !! userGroups ? <div>
                {userGroups.map((userGroup, i) => {
                    return (
                        <UserGroupItem userGroup={userGroups}/>
                    );
                })}
            </div> : null;
        }

        const UserGroupItem = ({ userGroup }) => {
            return (
                <StyledUserGroupItem>
                    <span>{userGroup.name}</span>
                </StyledUserGroupItem>
            );
        }


        return (
            <StyledPanel>
                <h2>
                    <FormattedMessage
                        id="settings.usergroups.heading"
                        defaultMessage="Owned User Groups"
                    />
                </h2>
                <StyledUserGroupList>
                    <UserGroupListItems userGroups={this.state.userGroups} />
                </StyledUserGroupList>
            </StyledPanel>
        );
    }
}