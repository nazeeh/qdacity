import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';
import Theme from '../common/styles/Theme.js';

import NavBar from '../common/NavBar.jsx';
import Index from './index/Index.jsx';
import PersonalDashboard from './personal-dashboard/PersonalDashboard.jsx';
import CourseDashboard from './course-dashboard/CourseDashboard.jsx';
import ProjectDashboard from './project-dashboard/ProjectDashboard.jsx';
import TermDashboard from './termCourse-dashboard/TermDashboard.jsx';
import TermCourseConfig from './termCourse-config/TermCourseConfig.jsx';
import Admin from './admin/Admin.jsx';
import CodingEditor from './coding-editor/CodingEditor.jsx';
import Faq from './help/Faq.jsx';
import TutorialEngine from '../common/tutorial/TutorialEngine.js';
import Tutorial from '../common/tutorial/Tutorial.jsx';
import Sidebar from '../common/tutorial/Sidebar.jsx';
import styled from 'styled-components';

// React-Intl
import IntlProvider from '../common/Localization/LocalizationProvider';



const ContentLeftRightSplitter = styled.div`
	background-Color:red;
	display: grid;
	/*grid-template-columns: auto 200px;*/ //is now in activated or deactivated -SideBar
	/*grid-template-rows: auto;*/
	grid-template-areas: "leftContent rightContent";
	/*
	width: 100vw;
	height: 100vh;
	*/
`;

const LeftContent = styled.div`
	grid-area: leftContent;
	background-color: yellow;
`;

const RightContent = styled.div`
	/*  width:200px;*/
	padding-top:50px;
	color:white;
	grid-area: rightContent;
	background-color: black;
`;


var activatedSideBar= 
{
	gridTemplateColumns: "auto 200px"
};

var deactivatedSideBar=
{
	gridTemplateColumns: "auto 0px"
};




export default class App extends React.Component {
	constructor(props) {
		super(props);

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

		//maybe default props: http://lucybain.com/blog/2016/react-state-vs-pros/
		var t = new TutorialEngine(this);
		this.state = {
			tutorialEngine: t,
			tutorialState: t.tutorialState
		};
	}

	componentDidMount() {
		this.state.tutorialEngine.appRootDidMount();
	}

	render() {

		var tut = {
			tutorialEngine: this.state.tutorialEngine,
			tutorialState: this.state.tutorialState
		};

		var showSideBar=(tut.tutorialState.showSidebar)?activatedSideBar:deactivatedSideBar;

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
										tutorial={tut}
										callback={acc => {
											this.account = acc;
											this.forceUpdate();
										}}
										{...props}
									/>
								)}
							/>
							
							<ContentLeftRightSplitter className="ContentLeftRightSplitter" style={showSideBar}>
								<LeftContent>	
									<Route
										path="/PersonalDashboard"
										render={props => (
											<PersonalDashboard account={this.account} {...props} />
										)}
									/>
									<Route
										path="/ProjectDashboard"
										render={props => (
											<ProjectDashboard
												account={this.account}
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/CourseDashboard"
										render={props => (
											<CourseDashboard account={this.account} {...props} />
										)}
									/>
									<Route
										path="/TermDashboard"
										render={props => (
											<TermDashboard account={this.account} {...props} />
										)}
									/>
									<Route
										path="/TermCourseConfig"
										render={props => (
											<TermCourseConfig account={this.account} {...props} />
										)}
									/>
									<Route
										path="/Admin"
										render={props => (
											<Admin
												account={this.account}
												chartScriptPromise={this.props.chartScriptPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/CodingEditor"
										render={props => (
											<CodingEditor
												account={this.account}
												mxGraphPromise={this.props.mxGraphPromise}
												{...props}
											/>
										)}
									/>
									<Route
										path="/Faq"
										render={props => <Faq account={this.account} {...props} />}
									/>
									<Route
										exact
										path="/"
										render={props => <Index account={this.account} {...props} />}
									/>								
								</LeftContent>
								<RightContent>									
									<Sidebar tutorial={tut} /> 
								</RightContent>
							</ContentLeftRightSplitter>
							
							
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
