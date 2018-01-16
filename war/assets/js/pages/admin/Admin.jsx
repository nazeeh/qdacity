import React from 'react'
import {
	FormattedMessage
} from 'react-intl';

import Users from './Users.jsx';
import AdminStats from './AdminStats.jsx';
import AdminProjectList from "./AdminProjectList.jsx";

import UnauthenticatedUserPanel from "../../common/UnauthenticatedUserPanel.jsx";

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: [],
			selectedUserId: '',
			authState: {
				isUserSignedIn: false,
				isUserRegistered: false
			}
		};

		this.setProjects = this.setProjects.bind(this);
		this.removeProject = this.removeProject.bind(this);

		// update on initialization
		this.updateUserStatusFromProps(props);
		scroll(0, 0);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateUserStatusFromProps(nextProps);
	}

	updateUserStatusFromProps(targetedProps) {
		this.setState({
			authState: targetedProps.auth.authState
		});
	}

	setSelectedUserId(userId) {
		this.setState({
			selectedUserId: userId
		});
	}

	setProjects(projects) {
		this.setState({
			projects: projects
		});
	}

	removeProject(index) {
		this.state.projects.splice(index, 1);
		this.setState({
			projects: this.state.projects
		});
	}


	render() {
		if (!this.state.authState.isUserSignedIn || !this.state.authState.isUserRegistered) {
			return (<UnauthenticatedUserPanel history={this.props.history}/>);
		}
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						<AdminStats chartScriptPromise={this.props.chartScriptPromise} />
						<div id="changeLog"></div>
					</div>
					<div className="col-lg-4">
						<div id="project-selection">
							<Users setSelectedUserId={(userId) => this.setSelectedUserId(userId)}/>
						</div>
						{
							this.state.selectedUserId && <div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title"><FormattedMessage id='admin.projects' defaultMessage='Projects' /></h3>
								</div>
								<div className="box-body">
									<AdminProjectList projects={this.state.projects} setProjects={this.setProjects}
													  removeProject={this.removeProject} history={this.props.history}
													  userId={this.state.selectedUserId}/>
								</div>
							</div>
						}
					</div>
				</div>
			</div>


		);
	}
}