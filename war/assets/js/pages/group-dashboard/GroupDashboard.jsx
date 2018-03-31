//@ts-check
import React, {Component} from 'react';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

export default class GroupDashboard extends Component {
	constructor(props) {
        super(props);

        const urlParams = URI(window.location.search).query(true);

        this.state = {
            userGroup: null,
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
            <p>GroupDashboard</p>
        );
    }
}