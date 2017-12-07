import React from 'react'

import Users from './Users.jsx';
import AdminStats from './AdminStats.jsx';
import AdminProjectList from "./AdminProjectList.jsx";

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            projects: [],
			selectedUserId: ''
        };

        this.setProjects = this.setProjects.bind(this);
        this.removeProject = this.removeProject.bind(this);

		scroll(0, 0);
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
							<Users setSelectedUserId={(userId) => this.setSelectedUserId(userId)}/>
						</div>
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">Projects</h3>
							</div>
							<div className="box-body">
								<AdminProjectList projects={this.state.projects} setProjects={this.setProjects} removeProject={this.removeProject} history={this.props.history} userId={this.state.selectedUserId}/>
							</div>
						</div>
					</div>
				</div>
			</div>


		);
	}
}