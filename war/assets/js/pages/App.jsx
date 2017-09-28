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

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.account = {
			isSignedIn: () => {
				return false;
			}
		};
	}



	render() {
		return (
			<Router>
				<ThemeProvider theme={Theme}>
					<div>
						<Route path="/" render={(props)=><NavBar client_id={this.props.apiCfg.client_id} scopes={this.props.apiCfg.scopes} callback={(acc)=> {this.account= acc; this.forceUpdate()} } {...props}/>}/>
						<Route path="/PersonalDashboard" render={(props)=><PersonalDashboard account={this.account}  {...props}/>}/>
						<Route path="/ProjectDashboard" render={(props)=><ProjectDashboard account={this.account} chartScriptPromise={this.props.chartScriptPromise} {...props} />}/>
						<Route path="/CourseDashboard" render={(props)=><CourseDashboard account={this.account} {...props} />}/>
						<Route path="/Admin" render={()=><Admin account={this.account} />}/>
						<Route path="/CodingEditor" render={(props)=><CodingEditor account={this.account} mxGraphPromise={this.props.mxGraphPromise} {...props}/>}/>
						<Route exact path="/" render={(props)=><Index account={this.account}  {...props}/>}/>
					</div>
				</ThemeProvider>
			</Router>
		);
	}
}