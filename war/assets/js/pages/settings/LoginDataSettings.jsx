//@ts-check
import React, {Component} from 'react';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { BtnDefault } from '../../common/styles/Btn.jsx'


const StyledPanel = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
    margin: 20px;
`;

const StyledAssociatedLoginList = styled.ul``;

export default class LoginDataSettings extends Component {
	constructor(props) {
        super(props);

        this.state = {
            associatedLogins: []
        }
        
        this.updateAssociatedLoginList = this.updateAssociatedLoginList.bind(this);
        this.props.auth.authentication.addAuthStateListener(this.updateAssociatedLoginList);

        this.updateAssociatedLoginList();
    }

    updateAssociatedLoginList() {
        const _this = this;

        gapi.client.qdacity.auth.getAssociatedLogins().execute(function(resp) {
            if (!resp.code) {
                _this.setState({
                    associatedLogins: resp.items
                });
            } else {
                console.error('Could not fetch any associated logins.');
                _this.setState({
                    associatedLogins: []
                });
            }
        });
    }
    
    render() {

        const AssociatedLoginListItems = ({ associatedLoginList }) => {
            console.log(associatedLoginList);
            return !! associatedLoginList ? <div>
                {associatedLoginList.map((associatedLogin, i) => {
                    return (
                        <AssociatedLoginListItem associatedLogin={associatedLogin}/>
                    );
                })}
            </div> : null;
        }

        const AssociatedLoginListItem = ({ associatedLogin }) => {
            console.log(associatedLogin);
            return (
                <li>{associatedLogin.provider + ' | ' + associatedLogin.externalEmail}</li>
            );
        }

        return (
            <div>
                <StyledPanel>
                    <h2>
                        <FormattedMessage
                            id="settings.logindata.heading"
                            defaultMessage="Login Data Settings"
                        />	
                    </h2>        

                    <StyledAssociatedLoginList>
                        <AssociatedLoginListItems associatedLoginList={this.state.associatedLogins}/>
                    </StyledAssociatedLoginList>
                </StyledPanel>

                <StyledPanel>
                    <h4>
                        <FormattedMessage
                            id="settings.logindata.add"
                            defaultMessage="Associate new Login"
                        />	
                    </h4>  
                    
                    <BtnDefault>
                        <i className="fa fa-google" />
                        <FormattedMessage
                            id="settings.logindata.add.google"
                            defaultMessage="Google"
                        />
                    </BtnDefault>
                </StyledPanel>
            </div>
        );
    }
}