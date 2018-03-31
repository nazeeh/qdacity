//@ts-check
import React, {Component} from 'react';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

export default class GroupDashboard extends Component {
	constructor(props) {
        super(props);
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