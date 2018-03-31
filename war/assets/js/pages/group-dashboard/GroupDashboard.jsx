//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';


const StyledDashboard = styled.div`
    margin-top: 35px;
    
    display: grid;
    grid-gap: 20px;
    grid-template-areas:
        "header header header"
        "projects courses users"
`;

const StyledPageHeader = styled.div`
    grid-area: header;

    padding-left: 20px;
`;

const StyledUserGroupName = styled.span`
    margin-left: 5px;
`;



export default class GroupDashboard extends Component {
	constructor(props) {
        super(props);

        const urlParams = URI(window.location.search).query(true);

        this.state = {
            userGroup: {
                name: ''
            },
            isOwner: false,
            isParticipant: false
        }
        
        this.init(urlParams.userGroup);
    }

    init(userGroupId) {
        const _this = this;

        UserGroupEndpoint.getUserGroupById(userGroupId)
            .then(function(resp) {
                _this.setState({
                    userGroup: resp,
                    isOwner: (resp.owners || []).includes(_this.props.auth.userProfile.qdacityId),
                    isParticipant: (resp.isParticipant || []).includes(_this.props.auth.userProfile.qdacityId)
                });        
            })
    }

    render() {
        if(!this.props.auth.authState.isUserSignedIn) {
            return <UnauthenticatedUserPanel history={this.props.history} auth={this.props.auth} />;
        }
        
        return (
            <StyledDashboard>
                <StyledPageHeader className="page-header">
                    <i className="fa fa-users" />
                    <StyledUserGroupName>{this.state.userGroup.name}</StyledUserGroupName>
                </StyledPageHeader>
			</StyledDashboard>
        );
    }
}