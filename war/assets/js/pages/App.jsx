import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Link,
	Redirect
} from 'react-router-dom';

import { ThemeProvider } from 'styled-components';
import Theme from '../common/styles/Theme.js';

import AuthenticationProvider from '../common/AuthenticationProvider.js';
import TestAuthenticationProvider from '../common/TestAuthenticationProvider.js';
import AuthorizationProvider from '../common/AuthorizationProvider.js';

import NavBar from '../common/NavBar.jsx';
import Index from './index/Index.jsx';
import PersonalDashboard from './personal-dashboard/PersonalDashboard.jsx';
import CourseDashboard from './course-dashboard/CourseDashboard.jsx';
import ProjectDashboard from './project-dashboard/ProjectDashboard.jsx';
import TermDashboard from './termCourse-dashboard/TermDashboard.jsx';
import ExercisePage from './ExercisePage/ExercisePage.jsx';
import TermCourseConfig from './termCourse-config/TermCourseConfig.jsx';
import Admin from './admin/Admin.jsx';
import AdminStats from './admin/AdminStats.jsx';
import AdminControl from './admin/AdminControl.jsx';
import AdminCosts from './admin/AdminCosts.jsx';
import CodingEditor from './coding-editor/CodingEditor.jsx';
import Faq from './help/Faq.jsx';
import UserMigration from './user-migration/UserMigration.jsx';
import TutorialEngine from '../common/tutorial/TutorialEngine.js';
import Tutorial from '../common/tutorial/Tutorial.jsx';
import Sidebar from '../common/tutorial/Sidebar.jsx';
import styled from 'styled-components';

// React-Intl
import IntlProvider from '../common/Localization/LocalizationProvider';

const TEST_MODE = $TEST_MODE$;

const ContentGrid = styled.div`
	display: grid;
	grid-template-areas: 'ContentMain ContentSidebar';
`;

//there is the normal Site-Content in it
const ContentMain = styled.div`
	grid-area: ContentMain;
`;

//there is, if acitvated, the sidebar for the Tutorial
const ContentSidebar = styled.div`
	padding: 10px;
	padding-top: 60px;
	color: #333;
	grid-area: ContentSidebar;
	background-color: rgb(232, 229, 229);
`;

//activatedSideBar, activatedSideBar2, deactivatedSideBar, deactivatedSideBar2 are
// Helper to show or not to show the sidebar
var activatedSideBar = {
	gridTemplateColumns: 'auto 250px'
};

var deactivatedSideBar = {
	gridTemplateColumns: 'auto 0px'
};

var activatedSideBar2 = {
	display: 'inline'
};

var deactivatedSideBar2 = {
	display: 'none'
};

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.authenticationProvider = (TEST_MODE == true ? new TestAuthenticationProvider() : new AuthenticationProvider());
		this.authorizationProvider = new AuthorizationProvider();

		//maybe default props: http://lucybain.com/blog/2016/react-state-vs-pros/
		var t = new TutorialEngine(this);
		this.state = {
			language: 'en',
			locale: 'en-US',
			messages: {},

			tutorialEngine: t,
			tutorialState: t.tutorialState,
			auth: {
				authState: {
					isUserSignedIn: false,
					isUserRegistered: false
				},
				userProfile: {
					name: '',
					email: '',
					picSrc: ''
				},
				updateUserStatus: () => {
					return this.updateUserStatus();
				},
				authentication: this.authenticationProvider,
				authorization: this.authorizationProvider
			}
		};

		const _this = this;

		// on page reloads: also reload profile data
		if (this.authenticationProvider.isSignedIn()) {
			_this.authenticationProvider.synchronizeTokenWithGapi();
			_this.updateUserStatus();
		} else {
			// try silent sign in
			_this.authenticationProvider.silentSignInWithGoogle().then(function() {
				_this.authenticationProvider.synchronizeTokenWithGapi();
				_this.updateUserStatus(); // somehow the auth state listener triggers too early!
			});
		}

		this.authenticationProvider.addAuthStateListener(function() {
			// update on every auth state change
			_this.updateUserStatus();
		});
	}

	/**
	 * Updates the state -> the supplied authState
	 * @returns {Promise}
	 */
	async updateUserStatus() {
		const _this = this;
		const promise = new Promise(async function(resolve, reject) {
			// 1. check if signed-in
			const loginStatus = _this.authenticationProvider.isSignedIn();
			if (!loginStatus && !_this.state.auth.authState.isUserSignedIn) {
				// no need to rerender!
				resolve();
				return;
			}

			_this.authenticationProvider.synchronizeTokenWithGapi(); // Bugfix: sometimes the token seems to get lost!
			// 2. get the user profile
			const profile = await _this.authenticationProvider.getProfile();
			/*
			* Removing query parameters from URL.
			* With google we always got ?sz=50 in the URL which gives you a
			* small low res thumbnail. Without parameter we get the original
			* image.
			* When adding other LoginProviders this needs to be reviewed
			*/
			var url = URI(profile.thumbnail).fragment(true);
			const picSrcWithoutParams = url.protocol() + '://' + url.hostname() + url.path();
			_this.state.auth.userProfile = {
				name: profile.name,
				email: profile.email,
				picSrc: picSrcWithoutParams
			};

			// 3. check if user is registered
			_this.authenticationProvider.getCurrentUser().then(
				function(user) {
					_this.state.auth.authState = {
						isUserSignedIn: loginStatus,
						isUserRegistered: !!user
					};
					_this.setState(_this.state);
					resolve();
				},
				function(err) {
					_this.state.auth.authState = {
						isUserSignedIn: loginStatus,
						isUserRegistered: false
					};
					_this.setState(_this.state);
					resolve();
				}
			);
		});
		return promise;
	}

	componentDidMount() {
		this.state.tutorialEngine.appRootDidMount();
	}

	componentDidUpdate() {
		var domObj = document.getElementById('ContentSidebarStyle');
		if (domObj != null) {
			domObj.style.minHeight = window.innerHeight - 22 + 'px';
		}
	}

	render() {
		var tut = {
			tutorialEngine: this.state.tutorialEngine,
			tutorialState: this.state.tutorialState
		};

		var showSideBar = tut.tutorialState.showSidebar
			? activatedSideBar
			: deactivatedSideBar; //if deactivated, the grid is shrinked to 0 px
		var showSideBar2 = tut.tutorialState.showSidebar
			? activatedSideBar2
			: deactivatedSideBar2; //if deactivated, the right content is epclicit set to display: none

		return (
			<IntlProvider
				app={this}
				locale={this.state.locale}
				language={this.state.language}
				messages={this.state.messages}
			>
				<Router>
					<ThemeProvider theme={Theme}>
						<div>
							<Route
								path="/"
								render={props => (
									<NavBar
										client_id={this.props.apiCfg.client_id}
										scopes={this.props.apiCfg.scopes}
										auth={this.state.auth}
										tutorial={tut}
										{...props}
									/>
								)}
							/>
							<ContentGrid className="ContentGrid" style={showSideBar}>
								<ContentMain>
									<Route
										path="/PersonalDashboard"
										render={props => (
											<PersonalDashboard auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										path="/ProjectDashboard"
										render={props => (
											<ProjectDashboard
												auth={this.state.auth}
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/CourseDashboard"
										render={props => (
											<CourseDashboard auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										path="/TermDashboard"
										render={props => (
											<TermDashboard auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										path="/TermCourseConfig"
										render={props => (
											<TermCourseConfig auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										path="/ExercisePage"
										render={props => (
											<ExercisePage auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										path="/Admin"
										render={props => (
											<Admin
												auth={this.state.auth}
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										exact
										path="/Admin"
										render={() => <Redirect to="/Admin/Control" />}
									/>
									<Route
										path="/Admin/Stats"
										render={props => (
											<AdminStats
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/Admin/Costs"
										render={props => (
											<AdminCosts
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/Admin/Control"
										render={props => (
											<AdminControl
												auth={this.state.auth}
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/CodingEditor"
										render={props => (
											<CodingEditor
												auth={this.state.auth}
												mxGraphPromise={this.props.mxGraphPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/Faq"
										render={props => <Faq auth={this.state.auth} {...props} />}
									/>
									<Route
										path="/UserMigration"
										render={props => (
											<UserMigration auth={this.state.auth} {...props} />
										)}
									/>
									<Route
										exact
										path="/"
										render={props => (
											<Index auth={this.state.auth} {...props} />
										)}
									/>
								</ContentMain>
								<ContentSidebar style={showSideBar2} id="ContentSidebarStyle">
									<Sidebar tutorial={tut} />
								</ContentSidebar>
							</ContentGrid>
							<Route
								path="/"
								render={props => <Tutorial tutorial={tut} {...props} />}
							/>
						</div>
					</ThemeProvider>
				</Router>
			</IntlProvider>
		);
	}
}
