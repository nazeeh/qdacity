//@ts-check
import React, {Component} from 'react';
import { Switch, Route } from 'react-router'
import styled from 'styled-components';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import NavigationSidebar from './NavigationSidebar.jsx';
import LocalizationSettingsPage from './LocalizationSettings.jsx';


const GridContainer = styled.div`
	padding-top: 51px;
    display: grid;
    
    @media (max-width: 767px) {
        grid-template-rows: auto auto;
        grid-template-areas:
            'sidebarNav' 'settingsContent';
        height: auto;
    }

    @media (min-width: 768px) {
        grid-template-columns: 200px auto;
        grid-template-areas:
            'sidebarNav settingsContent';
        height: 100vh;
    }
`;

const SidebarNav = styled.div`
    grid-area: sidebarNav;
    background-color: ${props => props.theme.defaultPaneBg};
    overflow-y: auto;

    & > div {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    @media (max-width: 767px) {
        border-bottom: 1px solid ${props => props.theme.borderDefault};
    }

    @media (min-width: 768px) {
        border-right: 1px solid ${props => props.theme.borderDefault};
    }
`;


const SettingsContent = styled.div`
    grid-area: settingsContent;
    overflow-y: auto;
`;


export default class SettingsPage extends Component {
	constructor(props) {
        super(props);

        this.redirectTo = this.redirectTo.bind(this);

        const { formatMessage } = IntlProvider.intl;
        
        this.navbarHeading = formatMessage({
            id: 'settings.menu.heading',
            defaultMessage: 'Settings'
        });
        this.navbarItems = [
            {
                iconClass: 'fa fa-user-circle',
                text: formatMessage({
                    id: 'settings.menu.user-data',
                    defaultMessage: 'User Data'
                }),
                onClick: () => this.redirectTo('/Settings'),
                items: [
                    {
                        text: formatMessage({
                            id: 'settings.menu.profile',
                            defaultMessage: 'Profile'
                        }),
                        onClick: () => this.redirectTo('/Settings'),
                    },
                    {
                        text: formatMessage({
                            id: 'settings.menu.billing',
                            defaultMessage: 'Billing'
                        }),
                        onClick: () => this.redirectTo('/Settings'),
                    },
                ]
            },
            {
                iconClass: 'fa fa-sign-in',
                text: formatMessage({
                    id: 'settings.menu.login-data',
                    defaultMessage: 'Login Data'
                }),
                onClick: () => this.redirectTo('/Settings')
            },
            {
                iconClass: 'fa fa-globe',
                text: formatMessage({
                    id: 'settings.menu.localization',
                    defaultMessage: 'Localization'
                }),
                onClick: () => this.redirectTo('/Settings/Localization')
            }
        ]
    }
    
    redirectTo(path) {
        this.props.history.push(path);
    }

    render() {
        return (
            <GridContainer>
                <SidebarNav>
                    <NavigationSidebar heading='Settings' items={this.navbarItems}/>
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