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
import Admin from './admin/Admin.jsx';
import CodingEditor from './coding-editor/CodingEditor.jsx';
import StartTutorial from '../common/tutorial/tutorialStart.js';
import Tutorial from '../common/tutorial/Tutorial.jsx';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.account = {
			isSignedIn: () => {
				return false;
			}
		};
		
		//maybe default props: http://lucybain.com/blog/2016/react-state-vs-pros/
		
		this.tutorialEngine={
			isActive: false,
			controller: new StartTutorial(this),
			appRoot: this
		};
			
		
	}
	
	componentDidMount()
	{
		var startTutorial=new StartTutorial();
		startTutorial.instrumentDomWithTutorialMainData();
	}
	

	render() {
		return (
			<Router>
				<ThemeProvider theme={Theme}>
					<div>
						<Route path="/" render={(props)=><NavBar client_id={this.props.apiCfg.client_id} scopes={this.props.apiCfg.scopes} tutorialEngine={this.tutorialEngine} callback={(acc)=> {this.account= acc; this.forceUpdate()} } {...props}/>}/>
						<Route path="/PersonalDashboard" render={(props)=><PersonalDashboard account={this.account} tutorialEngine={this.tutorialEngine}  {...props}/>}/>
						<Route path="/ProjectDashboard" render={(props)=><ProjectDashboard account={this.account} tutorialEngine={this.tutorialEngine} chartScriptPromise={this.props.chartScriptPromise} {...props} />}/>
						<Route path="/CourseDashboard" render={(props)=><CourseDashboard account={this.account} tutorialEngine={this.tutorialEngine}  {...props} />}/>
						<Route path="/Admin" render={()=><Admin account={this.account} tutorialEngine={this.tutorialEngine} />}/>
						<Route path="/CodingEditor" render={(props)=><CodingEditor account={this.account} tutorialEngine={this.tutorialEngine}  mxGraphPromise={this.props.mxGraphPromise} {...props}/>}/>
						<Route exact path="/" render={(props)=><Index account={this.account} tutorialEngine={this.tutorialEngine}  {...props}/>}/>											
					</div>
				</ThemeProvider>
			</Router>
		);
	}
						
						
}