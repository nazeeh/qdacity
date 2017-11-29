import React from 'react'
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'

import {
	ThemeProvider
} from 'styled-components';
import Theme from '../common/styles/Theme.js';

import NavBar from '../common/NavBar.jsx';
import Index from './index/Index.jsx';
import PersonalDashboard from "./personal-dashboard/PersonalDashboard.jsx"
import CourseDashboard from "./course-dashboard/CourseDashboard.jsx"
import ProjectDashboard from "./project-dashboard/ProjectDashboard.jsx"
import TermDashboard from "./termCourse-dashboard/TermDashboard.jsx"
import TermCourseConfig from "./termCourse-config/TermCourseConfig.jsx"
import Admin from './admin/Admin.jsx';
import CodingEditor from './coding-editor/CodingEditor.jsx';

// React-Intl
import {
	IntlProvider
} from 'react-intl';
import {
	isSupportedLanguage,
	loadMessages
} from '../common/languageProvider.js';

export default class App extends React.Component {
	constructor(props) {
		super(props);

		const localeOrLanguage = navigator.language || navigator.browserLanguage;

		this.props.changeLanguage = this.changeLanguage.bind(this);
		this.props.messages = loadMessages.bind(this);

		const language = localeOrLanguage.split('-', 2).shift();

		this.state = {
			language: 'en',
			locale: 'en-US',
			messages: {}
		};

		this.account = {
			isSignedIn: () => {
				return false;
			}
		};

		// load initial language
		this.changeLanguage(language);
	}

	changeLanguage(language = 'en') {
		if (isSupportedLanguage(language)) {
			loadMessages(this, language);
			console.log('lang', language);
		} else {
			console.error('unsupported language:', language);
		}
	}

	render() {
		return (
			<IntlProvider locale={this.state.locale} language={this.state.language} messages={this.state.messages}>
				<Router>
					<ThemeProvider theme={Theme}>
						<div>
							<Route path="/" render={(props) => <NavBar client_id={this.props.apiCfg.client_id} scopes={this.props.apiCfg.scopes} callback={(acc) => { this.account = acc; this.forceUpdate() }} {...props} />} />
							<Route path="/PersonalDashboard" render={(props) => <PersonalDashboard account={this.account}  {...props} />} />
							<Route path="/ProjectDashboard" render={(props) => <ProjectDashboard account={this.account} chartScriptPromise={this.props.chartScriptPromise} {...props} />} />
							<Route path="/CourseDashboard" render={(props) => <CourseDashboard account={this.account} {...props} />} />
							<Route path="/TermDashboard" render={(props)=><TermDashboard account={this.account} {...props} />}/>
							<Route path="/TermCourseConfig" render={(props)=><TermCourseConfig account={this.account} {...props} />}/>
							<Route path="/Admin" render={() => <Admin account={this.account} />} />
							<Route path="/CodingEditor" render={(props) => <CodingEditor account={this.account} mxGraphPromise={this.props.mxGraphPromise} {...props} />} />
							<Route exact path="/" render={(props) => <Index account={this.account}  {...props} />} />
						</div>
					</ThemeProvider>
				</Router>
			</IntlProvider>
		);
	}
}