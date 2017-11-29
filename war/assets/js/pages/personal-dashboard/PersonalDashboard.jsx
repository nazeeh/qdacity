import React from 'react'

import ProjectList from "./ProjectList.jsx"
import CourseList from "./CourseList.jsx"
import NotificationList from "./NotificationList.jsx"
import WelcomePanel from "./WelcomePanel.jsx"
import AdvertPanel from "./AdvertPanel.jsx"
import UnauthenticatedUserPanel from "../../common/UnauthenticatedUserPanel.jsx"

export default class PersonalDashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: [],
			courses: [],
			isSignedIn: false
		};

		this.setProjects = this.setProjects.bind(this);
		this.addProject = this.addProject.bind(this);
		this.removeProject = this.removeProject.bind(this);
		this.setCourses = this.setCourses.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.removeCourse = this.removeCourse.bind(this);

		const _this = this;
		this.props.account.addAuthStateListener(function() {
			// update on every auth state change
			_this.updateLoginStatus();
		});
		
		// update on initialization
		this.updateLoginStatus();

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

	setCourses(courses) {
		this.setState({
			courses: courses
		});
	}

	addCourse(course) {
		this.state.courses.push(course);
		this.setState({
			courses: this.state.courses
		});
	}

	removeCourse(index) {
		this.state.courses.splice(index, 1);
		this.setState({
			courses: this.state.courses
		});
	}

	updateLoginStatus() {
		const loginStatus = this.props.account.isSignedIn();
		if(loginStatus !== this.state.isSignedIn) {
			this.state.isSignedIn = loginStatus;
			this.setState(this.state); 
		}
	}

	render() {
		if (!this.state.isSignedIn) return (<UnauthenticatedUserPanel account={this.props.account} history={this.props.history}/>);
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						  <WelcomePanel account={this.props.account}  history={this.props.history}/>
						  <AdvertPanel/>
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
						<div>
							<div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title">Courses</h3>
								</div>
								<div className="box-body">
									<CourseList courses={this.state.courses} setCourses={this.setCourses} addCourse={this.addCourse} removeCourse={this.removeCourse} history={this.props.history}/>
								</div>
							</div>
						</div>
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">Notifications</h3>
							</div>
							<div className="box-body">
								<NotificationList addProject={this.addProject} addCourse={this.addCourse} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}