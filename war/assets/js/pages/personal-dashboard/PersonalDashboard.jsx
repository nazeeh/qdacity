import React from 'react'

import ProjectList from "./ProjectList.jsx"
import NotificationList from "./NotificationList.jsx"
import WelcomePanel from "./WelcomePanel.jsx"

export default class PersonalDashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: []
		};

		this.setProjects = this.setProjects.bind(this);
		this.addProject = this.addProject.bind(this);
		this.removeProject = this.removeProject.bind(this);

		$("body").css({
			overflow: "auto"
		});
	}

	setProjects(projects) {
		this.setState({
			projects: projects
		});
	}

	addProject(project) {
		this.state.projects.push(project);
		this.setState({
			projects: this.state.projects
		});
	}

	removeProject(index) {
		this.state.projects.splice(index, 1);
		this.setState({
			projects: this.state.projects
		});
	}

	render() {
		if (!this.props.account.getProfile) return null;
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						  <WelcomePanel account={this.props.account}/>
					</div>
					<div className="col-lg-4">
						<div>
							<div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title">Projects</h3>
								</div>
								<div className="box-body">
									<ProjectList projects={this.state.projects} setProjects={this.setProjects} addProject={this.addProject} removeProject={this.removeProject} history={this.props.history} />
								</div>
							</div>
						</div>
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">Notifications</h3>
							</div>
							<div className="box-body">
								<NotificationList addProject={this.addProject}  />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}