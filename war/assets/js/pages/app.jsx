import React from 'react'
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'


import NavBar from '../common/NavBar.jsx';
import Index from './index/Index.jsx';
import PersonalDashboard from "./personal-dashboard/PersonalDashboard.jsx"
import ProjectDashboard from "./project-dashboard/ProjectDashboard.jsx"
import Admin from './admin/Admin.jsx';
import CodingEditor from './coding-editor/CodingEditor.jsx';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.account = {
			isSignedIn: () => {return false;}
		};
	}



	render(){
		return(
			<Router>
			<div>
				<Route path="/" render={(props)=><NavBar client_id={this.props.apiCfg.client_id} scopes={this.props.apiCfg.scopes} callback={(acc)=> {this.account= acc; this.forceUpdate()} } {...props}/>}/>
				<Route path="/PersonalDashboard" render={(props)=><PersonalDashboard account={this.account}  {...props}/>}/>
				<Route path="/ProjectDashboard" render={(props)=><ProjectDashboard account={this.account} {...props} />}/>
				<Route path="/Admin" render={()=><Admin account={this.account} />}/>
				<Route path="/CodingEditor" render={(props)=><CodingEditor account={this.account} {...props}/>}/>
				<Route exact path="/" render={(props)=><Index account={this.account}  {...props}/>}/>
			</div>
		</Router>
		);
	}
}