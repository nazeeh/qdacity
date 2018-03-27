//@ts-check
import React, {Component} from 'react';
import { Switch, Route } from 'react-router'
import styled from 'styled-components';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import LocalizationSettingsPage from './LocalizationSettings.jsx';


const GridContainer = styled.div`
	padding-top: 51px;
	display: grid;
	grid-template-columns: 200px auto;
	grid-template-areas:
        'sidebarNav settingsContent';
    height: 100vh;
`;

const SidebarNav = styled.div`
    grid-area: sidebarNav;
    height: 100fr;
    background-color: ${props => props.theme.defaultPaneBg};
	border-right: 1px solid ${props => props.theme.borderDefault};
    overflow-y: auto;
`;


const SettingsContent = styled.div`
    grid-area: settingsContent;
    overflow-y: auto;
`;


export default class SettingsPage extends Component {
	constructor(props) {
        super(props);
    }
    

    render() {
        return (
            <GridContainer>
                <SidebarNav>
                    Hallo123
                </SidebarNav>
                <SettingsContent>
                    <Switch>
                        <Route
                            path="/Settings/Localization"
                            render={props => (
                                <LocalizationSettingsPage
                                    locale={this.props.locale}
                                    language={this.props.language}
                                    messages={this.props.messages}
                                    auth={this.props.auth} 
                                />
                            )}
                        />
                    </Switch>
                </SettingsContent>
            </GridContainer>
        );
    }
}