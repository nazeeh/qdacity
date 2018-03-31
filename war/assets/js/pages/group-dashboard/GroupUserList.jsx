//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

export default class GroupUserList extends Component {
	constructor(props) {
        super(props);
    }

    renderUsers() {
        
    }
    
    render() {
        return (
            <div className="box box-default">
                <div className="box-header with-border">
                    <h3 className="box-title">
                        <FormattedMessage
                            id="usergroup..userlist.heading"
                            defaultMessage="Users"
                        />
                    </h3>
                </div>
                <div className="box-body">{this.renderUsers()}</div>
            </div>
        );
    }
}