//@ts-check
import React, {Component} from 'react';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { BtnPrimary } from '../../common/styles/Btn.jsx';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';



const StyledPanel = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
    margin: 20px;
`;

const StyledUserGroupHeading = styled.h2`
    margin-bottom: 30px;
`;

const StyledUserGroupList = styled.ul`
    padding-left: 5px;
    margin-top: 30px;
    list-style: none;
`;

const StyledUserGroupItem = styled.li`
    padding: 3px 5px;
    margin-bottom: 5px;

    cursor: pointer;

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

    onCreateUserGroup() {
        const _this = this;
        const { formatMessage } = IntlProvider.intl;

        const groupNameLabel = formatMessage({
			id: 'settings.usergroup.create.groupName',
			defaultMessage: 'Name'
		});

        vex.dialog.open({
            message: formatMessage({
                id: 'settings.usergroup.create.heading',
                defaultMessage: 'Create a new User Group.'
            }),
            input: [
                `<label for="groupName">${groupNameLabel}</label><input name="groupName" required />`
            ].join('\n'),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: formatMessage({
                        id: 'settings.usergroup.create.create',
                        defaultMessage: 'Create'
                    })
                }),
                $.extend({}, vex.dialog.buttons.NO, {
                    text: formatMessage({
                        id: 'settings.usergroup.create.cancel',
                        defaultMessage: 'Cancel'
                    })
                })
            ],
            callback: async function(data) {
                if (data === false) {
                    return console.log('Cancelled');
                }
                _this.createUserGroup({
                    name: data.groupName
                })
            }
        });
    }

    createUserGroup(groupData) {
        const _this = this;
        const { formatMessage } = IntlProvider.intl;

        UserGroupEndpoint.insertUserGroup(groupData.name).then(function(resp) {
            _this.updateUserGroups();
        }).catch(function(err) {
            vex.dialog.open({
                message: formatMessage({
                    id: 'settings.usergroup.create.failure',
                    defaultMessage: 'Could not create the User Group!'
                }),
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: formatMessage({
                            id: 'settings.usergroup.create.failure.ok',
                            defaultMessage: 'OK'
                        })
                    })
                ]
            });
        });
    }


    
    render() {

        const UserGroupListItems = ({ userGroups }) => {
            return !! userGroups ? <div>
                {userGroups.map((userGroup, i) => {
                    return (
                        <UserGroupItem userGroup={userGroup}/>
                    );
                })}
            </div> : null;
        }

        const UserGroupItem = ({ userGroup }) => {
            return (
                <StyledUserGroupItem onClick={() => this.props.history.push('/GroupDashboard?userGroup=' + userGroup.id)}>
                    <span>{userGroup.name}</span>
                </StyledUserGroupItem>
            );
        }


        return (
            <StyledPanel>
                <StyledUserGroupHeading>
                    <FormattedMessage
                        id="settings.usergroups.heading"
                        defaultMessage="Owned User Groups"
                    />
                </StyledUserGroupHeading>
                <BtnPrimary onClick={() => this.onCreateUserGroup()}>
                    <i className="fa fa-plus"/>
                    <FormattedMessage
                        id="settings.usergroups.create"
                        defaultMessage="Create new User Group"
                    />
                </BtnPrimary>
                <StyledUserGroupList>
                    <UserGroupListItems userGroups={this.state.userGroups} />
                </StyledUserGroupList>
            </StyledPanel>
        );
    }
}