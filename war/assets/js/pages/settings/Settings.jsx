//@ts-check
import React, {Component} from 'react';
import { Switch, Route } from 'react-router'
import IntlProvider from '../../common/Localization/LocalizationProvider';

import LocalizationSettingsPage from './LocalizationSettings.jsx';

export default class SettingsPage extends Component {
	constructor(props) {
        super(props);
    }
    

    render() {
        return (
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
        );
    }
}