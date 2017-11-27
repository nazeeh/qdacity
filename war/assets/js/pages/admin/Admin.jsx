import React from 'react'

import Users from './Users.jsx';
import AdminStats from './AdminStats.jsx';
import ProjectList from "../personal-dashboard/ProjectList.jsx";

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            projects: [],
        };

        this.setProjects = this.setProjects.bind(this);
        this.addProject = this.addProject.bind(this);
        this.removeProject = this.removeProject.bind(this);

		scroll(0, 0);
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
        if (!this.props.account.getProfile || !this.props.account.isSignedIn()) return null;
        return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						<div className="box box-default">
							<div className="b ox-header with-border">
								<h3 className="box-title">Statistics</h3>
							</div>
							<div className="box-body">
								<AdminStats />
							</div>
						</div>
						<div id="changeLog"></div>
					</div>
					<div className="col-lg-4">
						<div id="project-selection">
							<Users/>
						</div>
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">Projects</h3>
							</div>
							<div className="box-body">
								<ProjectList projects={this.state.projects} setProjects={this.setProjects} addProject={this.addProject} removeProject={this.removeProject} history={this.props.history} />
							</div>
						</div>
					</div>
				</div>
			</div>


		);
	}
}