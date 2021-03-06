import React from 'react';
import { FormattedMessage } from 'react-intl';

import ProjectList from './ProjectList.jsx';
import CourseList from './CourseList.jsx';
import UserGroupList from './UserGroupList.jsx';
import NotificationList from './NotificationList.jsx';
import WelcomePanel from './WelcomePanel.jsx';
import AdvertPanel from './AdvertPanel.jsx';
import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

export default class PersonalDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			projects: [],
			courses: [],
			userGroups: []
		};

		this.setProjects = this.setProjects.bind(this);
		this.addProject = this.addProject.bind(this);
		this.removeProject = this.removeProject.bind(this);
		this.setCourses = this.setCourses.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.removeCourse = this.removeCourse.bind(this);
		this.setUserGroups = this.setUserGroups.bind(this);

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

	setUserGroups(userGroups) {
		this.setState({
			userGroups: userGroups
		});
	}

	render() {
		if (!this.props.auth.authState.isUserSignedIn) {
			return (
				<UnauthenticatedUserPanel
					history={this.props.history}
					auth={this.props.auth}
				/>
			);
		}
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						<WelcomePanel auth={this.props.auth} history={this.props.history} />
						<AdvertPanel />
					</div>
					<div className="col-lg-4">
						<div>
							<div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title">
										<FormattedMessage
											id="personaldashboard.projects"
											defaultMessage="Projects"
										/>
									</h3>
								</div>
								<div className="box-body">
									<ProjectList
										projects={this.state.projects}
										setProjects={this.setProjects}
										addProject={this.addProject}
										removeProject={this.removeProject}
										userGroups={this.state.userGroups}
										history={this.props.history}
									/>
								</div>
							</div>
						</div>
						<div>
							<div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title">
										<FormattedMessage
											id="personaldashboard.courses"
											defaultMessage="Courses"
										/>
									</h3>
								</div>
								<div className="box-body">
									<CourseList
										courses={this.state.courses}
										setCourses={this.setCourses}
										addCourse={this.addCourse}
										removeCourse={this.removeCourse}
										userGroups={this.state.userGroups}
										history={this.props.history}
									/>
								</div>
							</div>
						</div>
						<div>
							<div className="box box-default">
								<div className="box-header with-border">
									<h3 className="box-title">
										<FormattedMessage
											id="personaldashboard.groups"
											defaultMessage="User Groups"
										/>
									</h3>
								</div>
								<div className="box-body">
									<UserGroupList
										userGroups={this.state.userGroups}
										auth={this.props.auth}
										history={this.props.history}
										setUserGroups={this.setUserGroups}
									/>
								</div>
							</div>
						</div>
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="personaldashboard.notifications"
										defaultMessage="Notifications"
									/>
								</h3>
							</div>
							<div className="box-body">
								<NotificationList
									addProject={this.addProject}
									addCourse={this.addCourse}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
